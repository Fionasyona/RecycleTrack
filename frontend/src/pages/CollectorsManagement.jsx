import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import {
  Truck,
  Plus,
  Trash2,
  Phone,
  Mail,
  X,
  Save,
  Loader,
  Search,
  User,
  CheckCircle,
} from "lucide-react";

const CollectorsManagement = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  });

  // 1. Fetch Collectors (ROBUST VERSION)
  const fetchCollectors = async () => {
    try {
      const res = await api.get("/users/admin/collectors/");
      console.log("Fetch Response:", res); // Debugging log

      // Check if 'res' is the array, or if 'res.data' is the array
      const data = Array.isArray(res) ? res : res.data || [];

      setCollectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching collectors:", error);
      toast.error("Could not load driver list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  // 2. Create Collector (ROBUST VERSION)
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await api.post("/users/admin/collectors/create/", formData);
      console.log("Create Response:", res); // Debugging log

      // ROBUST CHECK: Is the new user in 'res' or 'res.data'?
      const newUser = res.data || res;

      if (newUser && newUser.id) {
        toast.success("Collector hired successfully!");
        setShowForm(false);
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          phone: "",
        });

        // Add the new valid user to the top of the list
        setCollectors((prev) => [newUser, ...prev]);
      } else {
        // If response is weird, force a refresh from server
        toast.success("Collector created (refreshing list...)");
        setShowForm(false);
        fetchCollectors();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create collector");
    } finally {
      setFormLoading(false);
    }
  };

  // 3. Delete Collector
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this collector?"))
      return;
    try {
      await api.delete(`/users/admin/collectors/${id}/delete/`);
      toast.success("Collector removed.");
      setCollectors(collectors.filter((c) => c.id !== id));
    } catch (error) {
      toast.error("Failed to delete collector");
    }
  };

  // Filter Collectors
  const filteredCollectors = collectors.filter(
    (c) =>
      (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Truck className="w-6 h-6 text-green-600" /> Fleet Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage your waste collection drivers.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search drivers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
              showForm
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Cancel" : "Add Collector"}
          </button>
        </div>
      </div>

      {/* ADD COLLECTOR FORM (Collapsible) */}
      {showForm && (
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 animate-fade-in shadow-inner">
          <h3 className="font-bold text-green-900 flex items-center gap-2 mb-4">
            <User size={18} /> Register New Driver
          </h3>

          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="First Name"
              required
              className="p-3 rounded border border-green-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              className="p-3 rounded border border-green-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="p-3 rounded border border-green-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Phone Number"
              required
              className="p-3 rounded border border-green-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <div className="md:col-span-2">
              <input
                type="password"
                placeholder="Temporary Password"
                required
                className="w-full p-3 rounded border border-green-200 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <p className="text-xs text-green-700 mt-1 ml-1 font-medium">
                * Share this password with the driver so they can log in.
              </p>
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-sm"
              >
                {formLoading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Driver
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Collectors List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Loader className="w-8 h-8 animate-spin text-green-600 mb-2" />
            Loading fleet...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="p-4">Driver Details</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCollectors.length > 0 ? (
                  filteredCollectors.map((c) => (
                    <tr
                      key={c.id || Math.random()}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                            {c.full_name ? (
                              c.full_name[0].toUpperCase()
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {c.full_name || "Unnamed"}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail size={12} />
                              {c.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          {c.phone || "No Phone"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors group"
                          title="Fire Driver"
                        >
                          <Trash2
                            size={18}
                            className="group-hover:scale-110 transition-transform"
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-8 text-center text-gray-500 italic"
                    >
                      No drivers found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorsManagement;
