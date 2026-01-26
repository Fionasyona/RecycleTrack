import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Search,
  Trophy,
  ShieldCheck,
  RefreshCw,
  Clock,
  MapPin,
  Package,
  User,
  Loader,
  Truck,
  X,
  History,
  Archive,
} from "lucide-react";

const AdminDashboard = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("queue");
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Verify State
  const [manualEmail, setManualEmail] = useState("");
  const [manualType, setManualType] = useState("Plastic");
  const [manualLoading, setManualLoading] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(null);

  // Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCollector, setSelectedCollector] = useState("");

  // 1. FETCH ALL DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      // ACTIVE REQUESTS
      const reqRes = await api.get("/users/pickup/pending/");
      setRequests(Array.isArray(reqRes) ? reqRes : reqRes.data || []);

      // COLLECTORS
      const colRes = await api.get("/users/admin/collectors/");
      setCollectors(Array.isArray(colRes) ? colRes : colRes.data || []);

      // HISTORY
      const histRes = await api.get("/users/admin/history/");
      setHistory(Array.isArray(histRes) ? histRes : histRes.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. ACTIONS
  const handleVerifyRequest = async (requestId) => {
    const toastId = toast.loading("Verifying pickup...");
    try {
      await api.post(`/users/pickup/verify/${requestId}/`);
      toast.success("Verified! Moved to History.", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error("Verification failed", { id: toastId });
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = window.prompt("Reason for rejection?");
    if (!reason) return;

    const toastId = toast.loading("Rejecting request...");
    try {
      await api.post(`/users/pickup/reject/${requestId}/`, { reason });
      toast.success("Request Rejected. Moved to History.", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error("Failed to reject request", { id: toastId });
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualEmail) return toast.error("Enter an email");
    setManualLoading(true);
    try {
      const res = await api.post("/users/award-points/", {
        email: manualEmail,
        waste_type: manualType,
      });
      toast.success("Manual Verification Successful!");
      setLastSuccess(res.data);
      setManualEmail("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error verifying user.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCollector) return toast.error("Please select a driver");
    try {
      await api.patch(`/users/pickup/assign/${selectedRequest.id}/`, {
        collector_id: selectedCollector,
      });
      toast.success("Driver assigned successfully!");
      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to assign driver");
    }
  };

  const openAssignModal = (req) => {
    setSelectedRequest(req);
    setSelectedCollector("");
    setShowAssignModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* HEADER: Stacked on Mobile, Row on Desktop */}
      <div className="bg-green-800 text-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-400" /> Admin Console
          </h1>
          <p className="text-green-100 mt-2 opacity-90 text-sm md:text-base">
            Manage pickups, assign drivers, and view records.
          </p>
        </div>

        {/* Stats Pills: Grid on Mobile, Flex on Desktop */}
        <div className="grid grid-cols-2 md:flex gap-3 md:gap-4 w-full md:w-auto">
          <div className="bg-green-700 px-4 py-3 rounded-xl border border-green-600 text-center">
            <p className="text-[10px] md:text-xs text-green-200 uppercase tracking-wider font-bold">
              Active
            </p>
            <p className="text-xl md:text-2xl font-bold">{requests.length}</p>
          </div>
          <div className="bg-green-900/50 px-4 py-3 rounded-xl border border-green-700 text-center">
            <p className="text-[10px] md:text-xs text-green-200 uppercase tracking-wider font-bold">
              History
            </p>
            <p className="text-xl md:text-2xl font-bold">{history.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* === LEFT COLUMN (Tabs) === */}
        <div className="lg:col-span-2 space-y-6">
          {/* TABS HEADER: Scrollable on very small screens */}
          <div className="flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("queue")}
              className={`flex items-center gap-2 pb-2 px-2 transition-colors font-bold whitespace-nowrap ${activeTab === "queue" ? "text-green-600 border-b-2 border-green-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Clock size={18} /> Active Queue
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 pb-2 px-2 transition-colors font-bold whitespace-nowrap ${activeTab === "history" ? "text-green-600 border-b-2 border-green-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Archive size={18} /> Past History
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center">
              <Loader className="w-8 h-8 animate-spin text-green-600 mb-2" />
              Loading data...
            </div>
          ) : (
            <>
              {/* === TAB 1: ACTIVE QUEUE === */}
              {activeTab === "queue" && (
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
                      <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        All Caught Up!
                      </h3>
                      <p className="text-gray-500">
                        No pending actions required.
                      </p>
                    </div>
                  ) : (
                    requests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Status Badges */}
                            {req.status === "collected" && (
                              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded uppercase">
                                Collected
                              </span>
                            )}
                            {req.status === "assigned" && (
                              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">
                                Assigned
                              </span>
                            )}
                            {req.status === "pending" && (
                              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded uppercase">
                                Pending
                              </span>
                            )}

                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">
                              {req.waste_type}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 flex flex-wrap items-center gap-2 text-sm md:text-base">
                            <User className="w-4 h-4 text-gray-400" />{" "}
                            {req.user_full_name || "Unknown"}
                            <span className="text-xs md:text-sm font-normal text-gray-500">
                              ({new Date(req.scheduled_date).toDateString()})
                            </span>
                          </h3>
                          <div className="text-sm text-gray-600 flex flex-col md:flex-row gap-1 md:gap-3">
                            <span className="flex items-center gap-1">
                              <Package size={12} /> {req.quantity}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {req.center_name}
                            </span>
                            {req.collector_name && (
                              <span className="flex items-center gap-1 text-blue-600 font-bold">
                                <Truck size={12} /> {req.collector_name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: Wrapped for mobile */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0">
                          {req.status === "pending" && (
                            <button
                              onClick={() => openAssignModal(req)}
                              className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 text-xs md:text-sm shadow-sm flex-1 md:flex-none justify-center"
                            >
                              <Truck size={14} /> Assign
                            </button>
                          )}
                          {req.status === "collected" && (
                            <button
                              onClick={() => handleVerifyRequest(req.id)}
                              className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 text-xs md:text-sm shadow-sm flex-1 md:flex-none justify-center"
                            >
                              <CheckCircle size={14} /> Verify
                            </button>
                          )}
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="bg-red-50 text-red-600 px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold hover:bg-red-100 flex items-center gap-2 text-xs md:text-sm border border-red-100 shadow-sm flex-1 md:flex-none justify-center"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* === TAB 2: HISTORY LOG === */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="text-center p-12 text-gray-400 italic">
                      No history records found.
                    </div>
                  ) : (
                    history.map((req) => (
                      <div
                        key={req.id}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center opacity-75 hover:opacity-100 transition-opacity gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {req.status === "verified" ? (
                              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                                <CheckCircle size={10} /> Verified
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                                <XCircle size={10} /> Rejected
                              </span>
                            )}
                            <span className="text-xs font-bold text-gray-500">
                              {new Date(
                                req.scheduled_date,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-bold text-gray-700 text-sm">
                            {req.user_full_name} - {req.waste_type} (
                            {req.quantity})
                          </p>
                          {req.rejection_reason && (
                            <p className="text-xs text-red-500 italic">
                              Reason: {req.rejection_reason}
                            </p>
                          )}
                        </div>
                        {req.collector_name && (
                          <p className="text-xs text-blue-500 flex items-center gap-1 mt-1 md:mt-0">
                            <Truck size={10} /> Driver: {req.collector_name}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* === RIGHT COLUMN: MANUAL ENTRY === */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-gray-500" /> Walk-in / Manual
          </h2>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleManualVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Resident Email
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="resident@gmail.com"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Waste Type
                  </label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="Plastic">Plastic (20 pts)</option>
                    <option value="Glass">Glass (15 pts)</option>
                    <option value="Paper">Paper (10 pts)</option>
                    <option value="Metal">Metal (30 pts)</option>
                    <option value="Electronics">Electronics (50 pts)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-black transition-colors"
                >
                  {manualLoading ? "Processing..." : "Confirm Drop-off"}
                </button>
              </form>
            </div>
          </div>

          {lastSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="font-bold text-green-900">Success!</h3>
              </div>
              <p className="text-sm text-green-800 mb-2">
                {lastSuccess.message}
              </p>
              <div className="flex justify-between text-sm font-bold border-t border-green-200 pt-2">
                <span>New Balance:</span>
                <span>{lastSuccess.new_total} pts</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === ASSIGN MODAL (Responsive) === */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <Truck size={18} /> Assign Driver
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-blue-300 hover:text-blue-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                  Pickup Details
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {selectedRequest?.waste_type} - {selectedRequest?.quantity}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedRequest?.center_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Driver
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedCollector}
                  onChange={(e) => setSelectedCollector(e.target.value)}
                >
                  <option value="">-- Choose a Driver --</option>
                  {collectors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.phone || "No Phone"})
                    </option>
                  ))}
                </select>
                {collectors.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No drivers found.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
