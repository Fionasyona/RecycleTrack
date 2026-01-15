// src/pages/MapView.jsx
import { useState, useEffect } from "react";
import { MapPin, Search, Filter, Navigation2 } from "lucide-react";
import RecyclingMap from "../components/maps/RecyclingMap";
import mapService from "../services/mapService";
import { Button } from "../components/common/Button";

const MapView = () => {
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showActivities, setShowActivities] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // --- Helper Functions (Defined locally to avoid service errors) ---

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  // --- Main Logic ---

  const loadCenters = async () => {
    try {
      // FIX 1: Use 'getCenters' (matching your service file)
      const response = await mapService.getCenters();
      // FIX 2: Handle response structure safely
      const data = response.data || response || [];
      setCenters(data);
      setFilteredCenters(data);
    } catch (error) {
      console.error("Error loading centers:", error);
    }
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Location error:", error)
      );
    }
  };

  const filterCenters = () => {
    let filtered = centers;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((c) => c.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        // Safe check for services (handle string vs object)
        const hasService =
          c.services &&
          c.services.some((s) => {
            const serviceName = typeof s === "string" ? s : s.service_name;
            return serviceName.toLowerCase().includes(query);
          });

        return (
          c.name.toLowerCase().includes(query) ||
          c.address.toLowerCase().includes(query) ||
          hasService
        );
      });
    }

    setFilteredCenters(filtered);
  };

  const getNearbyCenter = async () => {
    if (!userLocation) {
      alert("Please enable location services to find nearby centers");
      return;
    }

    try {
      // FIX 3: Use 'getNearbyCenters' (plural)
      const response = await mapService.getNearbyCenters(
        userLocation.lat,
        userLocation.lng
      );
      const data = response.data || response || [];
      setFilteredCenters(data);
    } catch (error) {
      console.error("Error finding nearby centers:", error);
    }
  };

  useEffect(() => {
    loadCenters();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedType, centers]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-600 p-3 rounded-xl">
              <MapPin className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Recycling Map
              </h1>
              <p className="text-gray-600">
                Find recycling centers and collection points near you
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, location, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="recycling_center">Recycling Centers</option>
                <option value="collection_point">Collection Points</option>
              </select>
            </div>

            {/* Nearby Button */}
            <Button onClick={getNearbyCenter} className="whitespace-nowrap">
              <Navigation2 size={18} />
              Find Nearby
            </Button>

            {/* Toggle Activities */}
            <Button
              variant={showActivities ? "primary" : "outline"}
              onClick={() => setShowActivities(!showActivities)}
              className="whitespace-nowrap"
            >
              {showActivities ? "Hide" : "Show"} My Activities
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <RecyclingMap
              showUserLocation={true}
              showRecyclingCenters={true}
              showUserActivities={showActivities}
              height="600px"
            />
          </div>

          {/* Sidebar - List of Centers */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Locations ({filteredCenters.length})
                </h2>
              </div>

              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {filteredCenters.length > 0 ? (
                  filteredCenters.map((center, idx) => (
                    <div
                      // FIX 4: Add fallback key to prevent console errors
                      key={center.id || idx}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-primary-300"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {center.type === "recycling_center" ? "🏭" : "📦"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">
                            {center.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {center.address}
                          </p>

                          {/* Services */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {center.services &&
                              center.services
                                .slice(0, 3)
                                .map((service, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                                  >
                                    {typeof service === "string"
                                      ? service
                                      : service.service_name}
                                  </span>
                                ))}
                          </div>

                          {/* Rating & Distance */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-yellow-600 font-semibold">
                              ⭐ {center.rating || "N/A"}
                            </span>
                            {userLocation && (
                              <span className="text-gray-600">
                                {formatDistance(
                                  calculateDistance(
                                    userLocation.lat,
                                    userLocation.lng,
                                    center.latitude || center.lat,
                                    center.longitude || center.lng
                                  )
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No locations found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
