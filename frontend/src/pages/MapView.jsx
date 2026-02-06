import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Globe, MapPin, Navigation, Phone, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { centerAPI } from "../services/api";

// --- LEAFLET ICON FIX ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icon for User Location
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper: Handles Flying to Locations
const FlyToLocation = ({ targetCenter }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [targetCenter, map]);
  return null;
};

const MapView = () => {
  const [centers, setCenters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [viewPosition, setViewPosition] = useState(null);
  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Default center (Nairobi)
  const defaultCenter = [-1.2921, 36.8219];

  useEffect(() => {
    fetchCenters();
    getUserLocation();
  }, []);

  const fetchCenters = async () => {
    try {
      const res = await centerAPI.getAll();
      setCenters(Array.isArray(res) ? res : res.results || []);
    } catch (error) {
      console.error("Map Error:", error);
      toast.error("Could not load recycling centers");
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setViewPosition([lat, lng]);
        },
        (error) => {
          console.log("Location access denied:", error);
          toast("Enable location to see centers near you", { icon: "📍" });
        },
      );
    }
  };

  const handleCenterClick = (center) => {
    setViewPosition([center.latitude, center.longitude]);
    setSelectedCenterId(center.id);
  };

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    // REMOVED <MainLayout> WRAPPER
    <div className="flex flex-col h-[calc(100vh-130px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden md:flex-row">
      {/* --- LEFT SIDEBAR: LIST --- */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white z-10">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search centers..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium px-1">
            {filteredCenters.length} locations found
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredCenters.map((center) => (
            <div
              key={center.id}
              onClick={() => handleCenterClick(center)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 ${
                selectedCenterId === center.id
                  ? "bg-green-50 border-l-4 border-l-green-500"
                  : ""
              }`}
            >
              <h3 className="font-bold text-gray-800 text-sm">{center.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {center.address}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {center.accepted_materials
                  .split(",")
                  .slice(0, 3)
                  .map((mat, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200"
                    >
                      {mat.trim()}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: MAP --- */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          <FlyToLocation targetCenter={viewPosition} />

          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>
                <div className="text-center p-1 font-bold text-indigo-600">
                  You are here
                </div>
              </Popup>
            </Marker>
          )}

          {centers.map((center) => (
            <Marker
              key={center.id}
              position={[center.latitude, center.longitude]}
              eventHandlers={{
                click: () => {
                  setSelectedCenterId(center.id);
                },
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-gray-900">{center.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{center.address}</p>
                  <div className="bg-green-50 p-2 rounded text-xs text-green-800 border border-green-100 mb-2">
                    <strong>Accepts:</strong> {center.accepted_materials}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-green-600 text-white py-1.5 rounded text-xs font-bold hover:bg-green-700 transition"
                  >
                    Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <button
          onClick={getUserLocation}
          className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-full shadow-lg text-gray-700 hover:bg-gray-50 border border-gray-200 transition active:scale-95"
          title="Find My Location"
        >
          <Navigation className="w-5 h-5 text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default MapView;
