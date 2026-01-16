import React, { useState, useEffect } from "react";
import { centerAPI } from "../services/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin, Navigation, Phone, Globe } from "lucide-react";
import L from "leaflet";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css"; // Ensure CSS is imported

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

// Custom Icon for User Location (Gold/Yellow)
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

// --- NEW HELPER: Handles Flying to Locations ---
// This component watches for changes in "targetCenter" and moves the map automatically
const FlyToLocation = ({ targetCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, 15, {
        animate: true,
        duration: 1.5, // Smooth flight duration
      });
    }
  }, [targetCenter, map]);

  return null;
};

const MapView = () => {
  const [centers, setCenters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // This state controls where the map looks.
  // It changes when you click the sidebar OR find your location.
  const [viewPosition, setViewPosition] = useState(null);

  // Track which center is selected to highlight it in the sidebar
  const [selectedCenterId, setSelectedCenterId] = useState(null);

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

          // Automatically fly to user location on load
          setViewPosition([lat, lng]);
        },
        (error) => {
          console.log("Location access denied:", error);
          toast("Enable location to see centers near you", { icon: "📍" });
        }
      );
    }
  };

  // Handler for clicking a sidebar item
  const handleCenterClick = (center) => {
    // 1. Set the map target to this center's coordinates
    setViewPosition([center.latitude, center.longitude]);
    // 2. Set active ID for highlighting
    setSelectedCenterId(center.id);
  };

  return (
    <div className="h-[calc(100vh-64px)] relative flex flex-col md:flex-row">
      {/* --- SIDEBAR LIST --- */}
      <div className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 shadow-xl z-[1000] overflow-y-auto">
        <div className="p-4 bg-green-600 text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Recycling Points
          </h2>
          <p className="text-xs text-green-100 mt-1">
            {centers.length} locations available
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {centers.map((center) => (
            <div
              key={center.id}
              onClick={() => handleCenterClick(center)} // <--- CLICK HANDLER
              className={`p-4 transition cursor-pointer hover:bg-green-50 ${
                selectedCenterId === center.id
                  ? "bg-green-50 border-l-4 border-green-500"
                  : ""
              }`}
            >
              <h3 className="font-semibold text-gray-800">{center.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{center.address}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {center.accepted_materials
                  .split(",")
                  .slice(0, 3)
                  .map((mat, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white border border-green-100 text-green-700 px-1.5 py-0.5 rounded"
                    >
                      {mat.trim()}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAP CONTAINER --- */}
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

          {/* This invisible component handles the flying animation */}
          <FlyToLocation targetCenter={viewPosition} />

          {/* User Marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>
                <div className="text-center p-1">
                  <strong className="text-indigo-600">You are here</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Recycling Center Markers */}
          {centers.map((center) => (
            <Marker
              key={center.id}
              position={[center.latitude, center.longitude]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  {center.image && (
                    <img
                      src={center.image}
                      alt={center.name}
                      className="w-full h-24 object-cover rounded-t-lg mb-2"
                    />
                  )}
                  <h3 className="font-bold text-base text-gray-900">
                    {center.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{center.address}</p>

                  <div className="space-y-1 mb-3">
                    {center.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" /> {center.phone}
                      </div>
                    )}
                    {center.website && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Globe className="w-3 h-3" />
                        <a
                          href={center.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-50 p-2 rounded text-xs text-green-800">
                    <strong>Accepts:</strong> {center.accepted_materials}
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center mt-3 bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700 transition"
                  >
                    Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Mobile: Find Me Button */}
        <button
          onClick={() => getUserLocation()}
          className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-full shadow-lg text-gray-700 hover:bg-gray-50 border border-gray-200"
          title="Find My Location"
        >
          <Navigation className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MapView;
