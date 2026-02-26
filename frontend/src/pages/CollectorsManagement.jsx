import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import {
  Truck,
  Trash2,
  Phone,
  Mail,
  X,
  Loader,
  Search,
  User,
  CheckCircle,
  MapPin,
  FileText,
  ShieldAlert,
  Eye,
  PackageCheck,
} from "lucide-react";

const CollectorsManagement = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State for Viewing Docs
  const [selectedDriver, setSelectedDriver] = useState(null);

  const fetchCollectors = async () => {
    try {
      const res = await api.get("/users/admin/collectors/");
      const data = Array.isArray(res) ? res : res.data || [];
      setCollectors(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Could not load driver list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/users/admin/collectors/${id}/delete/`);
      toast.success("Collector removed.");
      setCollectors(collectors.filter((c) => c.id !== id));
    } catch (error) {
      toast.error("Failed to delete collector");
    }
  };

  // --- Verify Driver Logic ---
  const handleVerify = async (driverId) => {
    if (!window.confirm("Verify this driver's documents and approve them?"))
      return;
    try {
      await api.patch(`/users/admin/verify-driver/${driverId}/`);
      toast.success("Driver Verified!");
      // Update UI locally to reflect change instantly
      setCollectors(
        collectors.map((c) =>
          c.id === driverId
            ? {
                ...c,
                driver_profile: { ...c.driver_profile, is_verified: true },
              }
            : c,
        ),
      );
      setSelectedDriver(null); // Close modal if open
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  const filteredCollectors = collectors.filter(
    (c) =>
      (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Truck className="w-6 h-6 text-green-600" /> Fleet Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage drivers, verify IDs, and track status.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search drivers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. DRIVERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader className="w-8 h-8 animate-spin mx-auto text-green-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="p-4">Driver Details</th>
                  <th className="p-4">Contact & Location</th>
                  <th className="p-4">Performance</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCollectors.length > 0 ? (
                  filteredCollectors.map((c) => {
                    // Check status
                    const isVerified = c.driver_profile?.is_verified;
                    const hasDocs =
                      c.driver_profile?.id_no || c.driver_profile?.license_no;
                    const jobsDone =
                      c.completed_jobs_count ||
                      c.driver_profile?.total_jobs ||
                      0;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                              {c.full_name?.[0] || <User size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {c.full_name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail size={12} /> {c.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone size={14} className="text-gray-400" />{" "}
                              {c.phone || "N/A"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <MapPin size={14} className="text-gray-400" />{" "}
                              {c.address || "Nairobi, KE"}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                              <PackageCheck size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg leading-none">
                                {jobsDone}
                              </p>
                              <span className="text-xs text-gray-500 font-medium uppercase">
                                Pickups
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                              <CheckCircle size={12} /> Verified
                            </span>
                          ) : !hasDocs ? (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold">
                              <Loader size={12} /> No Docs Yet
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold animate-pulse">
                              <ShieldAlert size={12} /> Pending Approval
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* NEW: Quick Verify Action in Table */}
                            {!isVerified && (
                              <button
                                onClick={() => handleVerify(c.id)}
                                className="text-green-600 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition"
                                title="Approve Driver"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}

                            {/* View Docs Button */}
                            <button
                              onClick={() => setSelectedDriver(c)}
                              className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition"
                              title="View Documents"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(c.id)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                              title="Remove Driver"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
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

      {/* 3. DOCUMENT VIEWER MODAL */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-500" /> Driver Documents
              </h3>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  {selectedDriver.full_name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {selectedDriver.full_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {selectedDriver.email}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    National ID Number
                  </label>
                  <p className="font-mono text-gray-800 font-bold text-lg">
                    {selectedDriver.driver_profile?.id_no || "Not Submitted"}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Driving License
                  </label>
                  <p className="font-mono text-gray-800 font-bold text-lg">
                    {selectedDriver.driver_profile?.license_no ||
                      "Not Submitted"}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition"
                >
                  Close
                </button>

                {/* FIXED: Removed restrictive TEMP check, based entirely on verification status */}
                {!selectedDriver.driver_profile?.is_verified && (
                  <button
                    onClick={() => handleVerify(selectedDriver.id)}
                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Approve Driver
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorsManagement;
