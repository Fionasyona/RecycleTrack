import { useState } from "react";
import { X, MapPin, Save, Loader } from "lucide-react";
import mapService from "../../services/mapService";

const AddCenterModal = ({ isOpen, onClose, onCenterAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "recycling_center",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    open_hours: "",
    services: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        services: formData.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      await mapService.createCenter(payload);

      alert("Center added successfully!");
      onCenterAdded();
      onClose();

      setFormData({
        name: "",
        type: "recycling_center",
        address: "",
        latitude: "",
        longitude: "",
        phone: "",
        open_hours: "",
        services: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to add center.");
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add New Center</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Center Name
            </label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              placeholder="e.g. Nairobi Central Recycling"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="recycling_center">Recycling Center</option>
                <option value="collection_point">Collection Point</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                placeholder="07..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Area, Street name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                required
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                placeholder="-1.2921"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                required
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                placeholder="36.8219"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={useCurrentLocation}
            className="text-sm text-primary-600 flex items-center gap-1 hover:underline"
          >
            <MapPin size={16} /> Use my current location
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services (comma separated)
            </label>
            <input
              required
              name="services"
              value={formData.services}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Plastic, Glass, E-waste"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Open Hours
            </label>
            <input
              name="open_hours"
              value={formData.open_hours}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Mon-Sat: 8am - 5pm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              Save Center
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCenterModal;
