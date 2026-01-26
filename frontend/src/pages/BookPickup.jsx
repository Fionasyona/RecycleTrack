import React, { useState, useEffect } from "react";
import { api, centerAPI } from "../services/api"; // Import centerAPI to fetch locations
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
} from "lucide-react";
import { Button } from "../components/common/Button"; // Assuming you have this, or use standard button

const BookPickup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    center_name: "",
    waste_type: "Plastic",
    quantity: "",
    scheduled_date: "",
  });

  // 1. Fetch Recycling Centers on Load
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await centerAPI.getAll();
        const centersList = Array.isArray(res) ? res : res.results || [];
        setCenters(centersList);

        // Auto-select the first center if available
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.center_name)
      return toast.error("Please select a recycling center");
    if (!formData.quantity)
      return toast.error("Please specify quantity (e.g. '2 bags')");

    setLoading(true);
    try {
      await api.post("/users/pickup/create/", formData);
      toast.success("Pickup Request Sent Successfully!");
      // Redirect user back to dashboard to see their points/status
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to book pickup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-gray-600 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* 1. Select Center */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> Select Recycling
                Center
              </label>
              <select
                name="center_name"
                className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
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
              {/* 2. Waste Type */}
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
                </select>
              </div>

              {/* 3. Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" /> Quantity
                </label>
                <input
                  type="text"
                  name="quantity"
                  placeholder="e.g. 2 bags, 5kg"
                  required
                  className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 4. Date */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" /> Pickup Date
              </label>
              <input
                type="date"
                name="scheduled_date"
                required
                className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formData.scheduled_date}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700"
              }`}
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
