import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Loader,
  MapPin,
  Navigation,
  Recycle,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api, centerAPI } from "../services/api";

const BookPickup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [allCenters, setAllCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [selectedCenterData, setSelectedCenterData] = useState(null);

  const [formData, setFormData] = useState({
    waste_type: "Plastic",
    center_name: "",
    // quantity removed - Driver will enter this
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
        toast.error("Could not load recycling centers");
      }
    };
    fetchCenters();
  }, []);

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

  useEffect(() => {
    if (formData.center_name) {
      const center = allCenters.find((c) => c.name === formData.center_name);
      setSelectedCenterData(center || null);
    } else {
      setSelectedCenterData(null);
    }
  }, [formData.center_name, allCenters]);

  const handleGetLocation = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation not supported.");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        await fetchAddressFromCoords(lat, lng);
        setGeoLoading(false);
      },
      () => {
        toast.error("Unable to retrieve location.");
        setGeoLoading(false);
      },
    );
  };

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        setFormData((prev) => ({
          ...prev,
          region: addr.suburb || addr.neighbourhood || addr.city || "Nairobi",
          pickup_address: addr.road || "Pinned Location",
        }));
        toast.success(`Address resolved`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send "Pending" for quantity since driver updates it
      await api.post("/users/pickup/create/", {
        ...formData,
        quantity: "Pending Weighing",
      });
      toast.success("Pickup Request Sent!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to book pickup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:py-6 py-4 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-green-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-green-700 md:px-8 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <Truck className="w-7 h-7" />
              <div>
                <h1 className="text-2xl font-bold">Book a Pickup</h1>
                <p className="text-green-100 text-xs opacity-90">
                  Quickly schedule a waste collection. Driver will weigh upon
                  arrival.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="md:p-8 p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              {/* LEFT COLUMN: WASTE INFO */}
              <div className="space-y-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  1. Waste Details
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                      <Recycle className="w-3.5 h-3.5 text-green-600" /> Waste
                      Type
                    </label>
                    <select
                      name="waste_type"
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.waste_type}
                      onChange={handleChange}
                    >
                      <option value="Plastic">Plastic</option>
                      <option value="Glass">Glass</option>
                      <option value="Paper">Paper</option>
                      <option value="Metal">Metal</option>
                      <option value="E-waste">E-waste</option>
                      <option value="Organic">Organic</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-green-600" /> Recycling
                    Center
                  </label>
                  <select
                    name="center_name"
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none"
                    value={formData.center_name}
                    onChange={handleChange}
                    disabled={filteredCenters.length === 0}
                  >
                    {filteredCenters.map((center) => (
                      <option key={center.id} value={center.name}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCenterData && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 flex items-center gap-3">
                    <img
                      src={
                        selectedCenterData.image ||
                        "https://via.placeholder.com/150"
                      }
                      className="w-12 h-12 rounded-lg object-cover"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-blue-900 text-xs truncate">
                        {selectedCenterData.name}
                      </h4>
                      <a
                        href={`https://www.google.com/maps?q=${selectedCenterData.latitude},${selectedCenterData.longitude}`}
                        target="_blank"
                        className="text-[10px] text-blue-600 font-bold flex items-center mt-1"
                      >
                        <ExternalLink size={10} className="mr-1" /> MAP VIEW
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: LOGISTICS */}
              <div className="space-y-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  2. Pickup Logistics
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-green-600" /> Pickup
                    Date
                  </label>
                  <input
                    type="date"
                    name="scheduled_date"
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      formData.latitude
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                    }`}
                  >
                    {geoLoading ? (
                      <Loader className="animate-spin" size={14} />
                    ) : (
                      <Navigation size={14} />
                    )}
                    {formData.latitude ? "Location Set ✅" : "Use GPS Location"}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="region"
                      placeholder="Region"
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                      value={formData.region}
                      onChange={handleChange}
                    />
                    <input
                      name="pickup_address"
                      placeholder="Street/Landmark"
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                      value={formData.pickup_address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                }`}
              >
                {loading ? <Loader className="animate-spin" /> : <Truck />}
                {loading ? "Processing..." : "Confirm Pickup Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookPickup;
