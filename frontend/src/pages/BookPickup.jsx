import React, { useState, useEffect } from "react";
import { api, centerAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Truck,
  Calendar,
  Recycle,
  MapPin,
  Package,
  Loader,
  ArrowLeft,
  Navigation,
} from "lucide-react";

const BookPickup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [centers, setCenters] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    center_name: "",
    waste_type: "Plastic",
    quantity: "",
    scheduled_date: "",
    pickup_address: "",
    region: "",
    latitude: null,
    longitude: null,
  });

  // 1. Fetch Recycling Centers
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await centerAPI.getAll();
        const centersList = Array.isArray(res) ? res : res.results || [];
        setCenters(centersList);
        if (centersList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            center_name: centersList[0].name,
          }));
        }
      } catch (error) {
        console.error("Failed to load centers", error);
        toast.error("Could not load recycling centers");
      }
    };
    fetchCenters();
  }, []);

  // --- NEW: REVERSE GEOCODING FUNCTION (Coords -> Text) ---
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim API (Free, No Key Required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;

        // Smart Mapping: Try to find the best fields for "Region" and "Address"
        const regionName =
          addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          addr.city ||
          "Nairobi";
        const streetName =
          addr.road ||
          addr.pedestrian ||
          addr.building ||
          addr.house_number ||
          "Pinned Location";

        setFormData((prev) => ({
          ...prev,
          region: regionName,
          pickup_address: streetName,
        }));
        toast.success(`Address found: ${streetName}, ${regionName}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error(
        "GPS active, but could not auto-fill text address. Please type it.",
      );
    }
  };
  // -------------------------------------------------------

  // 2. GPS Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation not supported.");

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        // --- Trigger Auto-Fill ---
        await fetchAddressFromCoords(lat, lng);
        setGeoLoading(false);
      },
      (error) => {
        toast.error(
          "Unable to retrieve location. Please type address manually.",
        );
        setGeoLoading(false);
      },
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.center_name) return toast.error("Please select a center");
    if (!formData.quantity) return toast.error("Please specify quantity");
    if (!formData.pickup_address || !formData.region)
      return toast.error("Please provide address details");

    setLoading(true);
    try {
      await api.post("/users/pickup/create/", formData);
      toast.success("Pickup Request Sent Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to book pickup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-gray-600 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-green-700 p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white/20 p-3 rounded-full">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Book a Pickup</h1>
            </div>
            <p className="text-green-100 opacity-90 ml-16">
              Schedule a waste collection from your preferred center.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> Select Recycling
                Center
              </label>
              <select
                name="center_name"
                className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.center_name}
                onChange={handleChange}
              >
                <option value="" disabled>
                  -- Choose a Center --
                </option>
                {centers.map((center) => (
                  <option key={center.id} value={center.name}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-green-600" /> Waste Type
                </label>
                <select
                  name="waste_type"
                  className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.waste_type}
                  onChange={handleChange}
                >
                  <option>Plastic</option>
                  <option>Glass</option>
                  <option>Paper</option>
                  <option>Metal</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" /> Quantity
                </label>
                <input
                  type="text"
                  name="quantity"
                  placeholder="e.g. 2 bags, 5kg"
                  required
                  className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" /> Pickup Date
              </label>
              <input
                type="date"
                name="scheduled_date"
                required
                className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.scheduled_date}
                onChange={handleChange}
              />
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Pickup Location Details
              </label>

              {/* GPS Button */}
              <button
                type="button"
                onClick={handleGetLocation}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-4 ${formData.latitude ? "bg-green-100 text-green-700 border border-green-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"}`}
              >
                {geoLoading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <Navigation size={18} />
                )}
                {geoLoading
                  ? "Resolving Address..."
                  : formData.latitude
                    ? "Address Auto-Filled ✅"
                    : "Use My Current Location"}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">
                    Region / Estate
                  </label>
                  <input
                    type="text"
                    name="region"
                    placeholder="e.g. South B"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    value={formData.region}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">
                    Street / Landmark
                  </label>
                  <input
                    type="text"
                    name="pickup_address"
                    placeholder="e.g. Gate 4, Maziwa Road"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    value={formData.pickup_address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                * GPS auto-fills these fields. You can edit them if needed.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-green-700"}`}
            >
              {loading ? <Loader className="animate-spin" /> : <Truck />}
              {loading ? "Processing..." : "Confirm Pickup Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookPickup;
