import React, { useState, useEffect } from "react";
import { centerAPI } from "../../services/api";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import {
  Plus,
  Edit,
  Trash,
  X,
  MapPin,
  Phone,
  Search,
  Loader,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import toast from "react-hot-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- LEAFLET ICON FIX ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- MAP HELPERS ---

// 1. Click Listener: Allows manual adjustments by clicking
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
};

// 2. Auto-Fly: Moves the map when the coordinates change (e.g. after searching)
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15); // Zoom level 15 for close-up accuracy
    }
  }, [center, map]);
  return null;
};

const ManageCenters = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // State for the "Searching..." loading spinner
  const [searchingLocation, setSearchingLocation] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    accepted_materials: "",
    latitude: "",
    longitude: "",
    image: null,
  });

  const defaultCenter = [-1.2921, 36.8219]; // Nairobi Default

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const res = await centerAPI.getAll();
      setCenters(Array.isArray(res) ? res : res.results || []);
    } catch (error) {
      toast.error("Failed to load centers");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: SMART SEARCH FUNCTION ---
  const handleGeocode = async () => {
    // 1. Validation
    if (!formData.address || formData.address.length < 3) {
      toast.error("Please enter a valid address or landmark first");
      return;
    }

    setSearchingLocation(true);
    try {
      // 2. Call OpenStreetMap Nominatim API (Free)
      const query = encodeURIComponent(formData.address + ", Kenya"); // Adding ", Kenya" improves accuracy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // 3. Success! Update coordinates
        const location = data[0];
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
        }));
        toast.success(`Found: ${location.display_name.split(",")[0]}`);
      } else {
        toast.error("Location not found. Try adding the city name.");
      }
    } catch (error) {
      toast.error("Could not search location. Check internet.");
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleMapClick = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      toast.error("Please set a location on the map!");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "image") {
        if (formData.image instanceof File) data.append(key, formData.image);
      } else if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    try {
      setLoading(true);
      if (currentId) {
        await centerAPI.update(currentId, data);
        toast.success("Center updated!");
      } else {
        await centerAPI.create(data);
        toast.success("Center created!");
      }
      resetForm();
      fetchCenters();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this center?")) return;
    try {
      await centerAPI.delete(id);
      toast.success("Deleted successfully");
      fetchCenters();
    } catch (error) {
      toast.error("Could not delete");
    }
  };

  const startEdit = (center) => {
    setFormData({
      name: center.name,
      address: center.address,
      phone: center.phone || "",
      website: center.website || "",
      accepted_materials: center.accepted_materials,
      latitude: center.latitude,
      longitude: center.longitude,
      image: center.image,
    });
    setCurrentId(center.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      website: "",
      accepted_materials: "",
      latitude: "",
      longitude: "",
      image: null,
    });
    setCurrentId(null);
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Manage Recycling Centers
        </h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-5 h-5 mr-2" /> Add Center
          </Button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {currentId ? "Edit Center" : "Add New Center"}
            </h2>
            <button onClick={resetForm}>
              <X className="text-gray-500" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-4">
              <Input
                label="Center Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Green Point Center"
                required
              />

              {/* --- NEW ADDRESS SECTION WITH SEARCH BUTTON --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address / Landmark
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="e.g. Westgate Mall, Westlands"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={searchingLocation}
                    className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center min-w-[120px]"
                    title="Find GPS coordinates for this address"
                  >
                    {searchingLocation ? (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    {searchingLocation ? "Finding..." : "Find on Map"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Enter a specific landmark (e.g., "Sarit Centre") for
                  better accuracy.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <Input
                  label="Website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accepted Materials
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                  rows="3"
                  placeholder="e.g. Plastic, Glass, Metal, Electronics"
                  value={formData.accepted_materials}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accepted_materials: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Image
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Location Confirmation
              </label>

              <div className="h-80 rounded-lg overflow-hidden border border-gray-300 relative z-0">
                <MapContainer
                  center={defaultCenter} // Initial render center
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  {/* --- NEW: Auto-Fly to new coordinates when found --- */}
                  {formData.latitude && (
                    <MapUpdater
                      center={[formData.latitude, formData.longitude]}
                    />
                  )}

                  <LocationMarker
                    position={
                      formData.latitude
                        ? { lat: formData.latitude, lng: formData.longitude }
                        : null
                    }
                    setPosition={handleMapClick}
                  />
                </MapContainer>
              </div>

              <div className="flex gap-4 text-sm text-gray-500 bg-gray-50 p-2 rounded justify-between items-center">
                <span>Lat: {formData.latitude || "Not set"}</span>
                <span>Lng: {formData.longitude || "Not set"}</span>
                {formData.latitude && (
                  <span className="text-green-600 font-bold text-xs">
                    ✓ Precise location set
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2 flex gap-4 pt-4 border-t">
              <Button type="submit" variant="primary" loading={loading}>
                Save Center
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List Section remains the same */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {centers.map((center) => (
          <div
            key={center.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
          >
            <div className="h-40 bg-gray-100 relative">
              {center.image ? (
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-300">
                  <MapPin className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {center.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex items-start gap-1">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />{" "}
                {center.address}
              </p>
              <div className="flex gap-2 pt-4 border-t mt-auto">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => startEdit(center)}
                >
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 text-xs"
                  onClick={() => handleDelete(center.id)}
                >
                  <Trash className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        {centers.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No centers found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCenters;
