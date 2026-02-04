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
  Info,
  ExternalLink, // New icon for map link
} from "lucide-react";

const BookPickup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [allCenters, setAllCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);

  // Store the full object of the currently selected center to show details
  const [selectedCenterData, setSelectedCenterData] = useState(null);

  const [formData, setFormData] = useState({
    waste_type: "Plastic",
    center_name: "",
    quantity: "",
    scheduled_date: "",
    pickup_address: "",
    region: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await centerAPI.getAll();
        const centersList = Array.isArray(res) ? res : res.results || [];
        setAllCenters(centersList);
      } catch (error) {
        console.error("Failed to load centers", error);
        toast.error("Could not load recycling centers");
      }
    };
    fetchCenters();
  }, []);

  // FILTER & AUTO-SELECT LOGIC
  useEffect(() => {
    if (allCenters.length === 0) return;

    const relevantCenters = allCenters.filter(
      (center) =>
        center.accepted_materials &&
        center.accepted_materials
          .toLowerCase()
          .includes(formData.waste_type.toLowerCase()),
    );

    setFilteredCenters(relevantCenters);

    // Check if current selection is valid
    const currentIsValid = relevantCenters.some(
      (c) => c.name === formData.center_name,
    );

    if (!currentIsValid) {
      if (relevantCenters.length > 0) {
        setFormData((prev) => ({
          ...prev,
          center_name: relevantCenters[0].name,
        }));
      } else {
        setFormData((prev) => ({ ...prev, center_name: "" }));
      }
    }
  }, [formData.waste_type, allCenters]);

  // UPDATE PREVIEW CARD LOGIC
  // Whenever the name changes, find the full object to display address/image
  useEffect(() => {
    if (formData.center_name) {
      const center = allCenters.find((c) => c.name === formData.center_name);
      setSelectedCenterData(center || null);
    } else {
      setSelectedCenterData(null);
    }
  }, [formData.center_name, allCenters]);

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
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
        toast.success(`Address found: ${streetName}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

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
        await fetchAddressFromCoords(lat, lng);
        setGeoLoading(false);
      },
      (error) => {
        toast.error("Unable to retrieve location.");
        setGeoLoading(false);
      },
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.center_name)
      return toast.error("No center available for this waste type");
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
            {/* 1. WASTE TYPE SELECTOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-green-600" /> Waste Type
                </label>
                <select
                  name="waste_type"
                  className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={formData.waste_type}
                  onChange={handleChange}
                >
                  <option value="Plastic">Plastic</option>
                  <option value="Glass">Glass</option>
                  <option value="Paper">Paper</option>
                  <option value="Metal">Metal</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Organic">Organic</option>
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

            {/* 2. CENTER SELECTION WITH PREVIEW CARD */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> Select Recycling
                Center
              </label>

              <div className="relative">
                <select
                  name="center_name"
                  className={`w-full p-4 border rounded-xl outline-none appearance-none ${filteredCenters.length === 0 ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-500"}`}
                  value={formData.center_name}
                  onChange={handleChange}
                  disabled={filteredCenters.length === 0}
                >
                  {filteredCenters.length === 0 ? (
                    <option value="">
                      No centers accept {formData.waste_type}!
                    </option>
                  ) : (
                    filteredCenters.map((center) => (
                      <option key={center.id} value={center.name}>
                        {center.name}{" "}
                        {/* Display name only to keep dropdown clean */}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* --- NEW: LOCATION PREVIEW CARD --- */}
              {selectedCenterData && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4 animate-fade-in">
                  {selectedCenterData.image ? (
                    <img
                      src={selectedCenterData.image}
                      alt="Center"
                      className="w-16 h-16 rounded-lg object-cover border border-blue-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center text-blue-300">
                      <MapPin size={24} />
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 text-sm">
                      {selectedCenterData.name}
                    </h4>
                    <p className="text-xs text-blue-700 mt-1 mb-2">
                      {selectedCenterData.address ||
                        "Location address not available"}
                    </p>

                    {/* View on Map Link */}
                    {selectedCenterData.latitude && (
                      <a
                        href={`https://www.google.com/maps?q=${selectedCenterData.latitude},${selectedCenterData.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <ExternalLink size={12} className="mr-1" /> View on
                        Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. DATE */}
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

            {/* 4. ADDRESS & GPS */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Pickup Location Details
              </label>

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
