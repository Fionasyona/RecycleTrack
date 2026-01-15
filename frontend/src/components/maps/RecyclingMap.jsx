import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { Navigation, MapPin, Phone, Clock, Star } from "lucide-react";
import mapService from "../../services/mapService";

// Fix Leaflet's default icon paths
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper to pick icons for activities (Defined locally)
const getActivityIcon = (type) => {
  switch (type) {
    case "plastic":
      return "🥤";
    case "paper":
      return "📄";
    case "glass":
      return "🍾";
    case "metal":
      return "🥫";
    case "electronics":
      return "🔋";
    default:
      return "♻️";
  }
};

// Custom marker icons
const createCustomIcon = (emoji, color = "#10b981") => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="${color}"/>
      <text x="12" y="16" text-anchor="middle" font-size="14" fill="white">${emoji}</text>
    </svg>
  `;
  const encodedSvg = encodeURIComponent(svg);

  return new Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodedSvg}`,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};

// Component to handle map centering
const MapController = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);

  return null;
};

const RecyclingMap = ({
  showUserLocation = true,
  showRecyclingCenters = true,
  showUserActivities = false,
  height = "500px",
}) => {
  const [centers, setCenters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default center (Nairobi)
  const defaultCenter = [-1.2921, 36.8219];

  useEffect(() => {
    const loadMapData = async () => {
      try {
        if (showRecyclingCenters) {
          // Use correct service name 'getCenters' and handle response.data
          const response = await mapService.getCenters();
          setCenters(response.data || response || []);
        }

        if (showUserActivities) {
          // Use correct service name 'getUserActivities'
          const response = await mapService.getUserActivities();
          setActivities(response.data || response || []);
        }
      } catch (error) {
        console.error("Error loading map data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();

    if (showUserLocation) {
      getUserLocation();
    }
  }, [showUserLocation, showRecyclingCenters, showUserActivities]);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.log("Could not get user location:", error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  const openDirections = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  if (loading && centers.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height, width: "100%" }}
        className="z-0"
      >
        <MapController center={mapCenter} />

        {/* Base Map Layer */}
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <Marker
            position={userLocation}
            icon={createCustomIcon("📍", "#3b82f6")}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-bold text-blue-600">You are here</p>
                <p className="text-xs text-gray-600">Your current location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Recycling Centers Markers */}
        {showRecyclingCenters &&
          centers.map((center, idx) => {
            // Handle both lat/lng and latitude/longitude formats safely
            const lat = center.latitude || center.lat;
            const lng = center.longitude || center.lng;

            // Skip if no coordinates
            if (!lat || !lng) return null;

            return (
              <Marker
                // Fallback to index if ID is missing (Fixes "unique key" error)
                key={center.id || `center-${idx}`}
                position={[lat, lng]}
                icon={createCustomIcon(
                  center.type === "recycling_center" ? "🏭" : "📦",
                  center.type === "recycling_center" ? "#10b981" : "#f59e0b"
                )}
              >
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {center.name}
                    </h3>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin
                          size={16}
                          className="text-gray-500 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-gray-700">{center.address}</span>
                      </div>

                      {center.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={16} className="text-gray-500" />
                          <a
                            href={`tel:${center.phone}`}
                            className="text-primary-600 hover:underline"
                          >
                            {center.phone}
                          </a>
                        </div>
                      )}

                      {center.open_hours && (
                        <div className="flex items-start gap-2 text-sm">
                          <Clock
                            size={16}
                            className="text-gray-500 mt-0.5 flex-shrink-0"
                          />
                          <span className="text-gray-700">
                            {center.open_hours}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Services:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {center.services &&
                          center.services.map((service, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full"
                            >
                              {typeof service === "string"
                                ? service
                                : service.service_name}
                            </span>
                          ))}
                      </div>
                    </div>

                    <button
                      onClick={() => openDirections(lat, lng)}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Navigation size={16} />
                      Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* User Activity Markers */}
        {showUserActivities &&
          activities.map((activity, idx) => {
            // Handle both lat/lng and latitude/longitude formats
            const lat = activity.latitude || activity.lat;
            const lng = activity.longitude || activity.lng;

            if (!lat || !lng) return null;

            return (
              <Marker
                // Fallback to index if ID is missing
                key={activity.id || `activity-${idx}`}
                position={[lat, lng]}
                icon={createCustomIcon(
                  getActivityIcon(activity.activity_type),
                  "#8b5cf6"
                )}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-purple-600 mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-semibold text-green-600 mt-1">
                      +{activity.points_earned} points
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <p className="text-xs font-bold text-gray-700 mb-2">Legend</p>
        <div className="space-y-1">
          {showUserLocation && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">📍</span>
              <span className="text-gray-600">Your Location</span>
            </div>
          )}
          {showRecyclingCenters && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-lg">🏭</span>
                <span className="text-gray-600">Recycling Center</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-lg">📦</span>
                <span className="text-gray-600">Collection Point</span>
              </div>
            </>
          )}
          {showUserActivities && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">♻️</span>
              <span className="text-gray-600">Your Activities</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecyclingMap;
