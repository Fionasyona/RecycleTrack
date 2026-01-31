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
  Search,
  Loader,
  Crosshair,
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
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [center, map]);
  return null;
};

const ManageCenters = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [gettingAddress, setGettingAddress] = useState(false);

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

  const defaultCenter = [-1.2921, 36.8219];

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

  // --- REVERSE GEOCODING (Coords -> Address) ---
  const reverseGeocode = async (lat, lng) => {
    setGettingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();

      if (data && data.display_name) {
        const cleanAddress = data.display_name.split(",").slice(0, 3).join(",");
        setFormData((prev) => ({
          ...prev,
          address: cleanAddress,
        }));
        toast.success("Address updated from map!");
      }
    } catch (error) {
      console.error("Reverse geocode failed", error);
    } finally {
      setGettingAddress(false);
    }
  };

  // --- GEOCODING (Address -> Coords) ---
  const handleGeocode = async () => {
    const input = formData.address;

    if (!input || input.length < 3) {
      toast.error("Enter an address OR paste coordinates");
      return;
    }

    setSearchingLocation(true);

    const coordinateRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = input.match(coordinateRegex);

    if (match) {
      // COORDINATE PASTE DETECTED
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[3]);

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
      await reverseGeocode(lat, lng);
      setSearchingLocation(false);
      return;
    }

    // NAME SEARCH
    try {
      let query = encodeURIComponent(input + ", Nairobi");
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
      );
      let data = await response.json();

      if (!data || data.length === 0) {
        query = encodeURIComponent(input + ", Kenya");
        response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
        );
        data = await response.json();
      }

      if (data && data.length > 0) {
        const location = data[0];
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
        }));
        const shortName = location.display_name.split(",")[0];
        toast.success(`Found: ${shortName}`);
      } else {
        toast.error("Address not found.");
      }
    } catch (error) {
      toast.error("Connection error.");
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
    reverseGeocode(latlng.lat, latlng.lng);
  };

  // --- FIXED HANDLE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Location
    if (!formData.latitude || !formData.longitude) {
      toast.error("Please set a location on the map!");
      return;
    }

    const data = new FormData();

    // 2. Explicitly append fields to avoid issues
    data.append("name", formData.name);
    data.append("address", formData.address);
    data.append("phone", formData.phone || "");
    data.append("website", formData.website || "");
    data.append("accepted_materials", formData.accepted_materials);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);

    // 3. Handle Image: Only append if it's a new File object
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

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
      console.error("Submit Error:", error);

      // 4. Show Specific Backend Error
      if (error.response && error.response.data) {
        const errorMsg = Object.entries(error.response.data)
          .map(([key, msgs]) => `${key}: ${msgs}`)
          .join(", ");
        toast.error(`Error: ${errorMsg}`);
      } else {
        toast.error("Operation failed. Check inputs.");
      }
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
      image: center.image, // URL string
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (Address OR Coordinates)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Address auto-fills when you click map"
                      required
                    />
                    {gettingAddress && (
                      <div className="absolute right-3 top-2.5">
                        <Loader className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={searchingLocation}
                    className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center min-w-[120px]"
                    title="Search Address or Jump to Coordinates"
                  >
                    {searchingLocation ? (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Find
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Crosshair size={12} />
                  <strong>Tip:</strong> Click map to auto-fill address, or paste
                  coords (e.g. -1.32, 36.8)
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

      {/* List Section */}
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
