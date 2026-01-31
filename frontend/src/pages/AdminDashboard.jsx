import {
  AlertTriangle,
  Archive,
  Calendar, // <--- ADDED THIS (Was missing)
  CalendarClock,
  CheckCircle,
  Clock,
  DollarSign,
  Loader,
  MapPin, // <--- Ensure this stays here
  Package,
  RefreshCw,
  ShieldCheck,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../services/api";

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

  // 1. FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      const reqRes = await api.get("/users/pickup/pending/");
      setRequests(Array.isArray(reqRes) ? reqRes : reqRes.data || []);

      const colRes = await api.get("/users/admin/collectors/");
      setCollectors(Array.isArray(colRes) ? colRes : colRes.data || []);

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
      toast.success("Request Rejected.", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error("Failed to reject request", { id: toastId });
    }
  };

  const openAssignModal = (req) => {
    setSelectedRequest(req);
    setSelectedCollector("");
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedCollector) return toast.error("Please select a driver");

    // Warn if assigning to unpaid request
    if (selectedRequest.payment_status !== "Paid") {
      if (
        !window.confirm("WARNING: This user has NOT paid yet. Assign anyway?")
      )
        return;
    }

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

  // Grouping Logic
  const groupRequestsByBookingDate = (items) => {
    const groups = {};
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.created_at || Date.now()) -
        new Date(a.created_at || Date.now()),
    );
    sorted.forEach((item) => {
      const dateStr = new Date(
        item.created_at || Date.now(),
      ).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 relative">
      {/* MODAL FOR ASSIGNMENT */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Assign Driver
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Select a driver for {selectedRequest.waste_type} pickup.
            </p>

            {/* PAYMENT WARNING IN MODAL */}
            {selectedRequest.payment_status === "Paid" ? (
              <div className="bg-green-50 text-green-700 text-xs font-bold p-2 rounded mb-4 flex items-center gap-2">
                <CheckCircle size={14} /> Payment Confirmed (Paid)
              </div>
            ) : (
              <div className="bg-red-50 text-red-700 text-xs font-bold p-2 rounded mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> Warning: Payment Pending (Unpaid)
              </div>
            )}

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {collectors.length === 0 ? (
                <p className="text-center text-gray-400 text-sm">
                  No drivers available.
                </p>
              ) : (
                collectors.map((driver) => (
                  <label
                    key={driver.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedCollector === driver.id
                        ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="driver"
                      value={driver.id}
                      checked={selectedCollector === driver.id}
                      onChange={() => setSelectedCollector(driver.id)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedCollector === driver.id
                          ? "border-green-600"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedCollector === driver.id && (
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {driver.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {driver.phone || "No phone"}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-green-800 text-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-400" /> Admin Console
          </h1>
          <p className="text-green-100 mt-2 opacity-90 text-sm md:text-base">
            Manage pickups, assignments & payments.
          </p>
        </div>
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
        <div className="lg:col-span-2 space-y-6">
          {/* TABS */}
          <div className="flex justify-between items-end border-b border-gray-200 pb-1">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("queue")}
                className={`flex items-center gap-2 pb-2 px-2 font-bold ${
                  activeTab === "queue"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Clock size={18} /> Active Queue
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 pb-2 px-2 font-bold ${
                  activeTab === "history"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Archive size={18} /> History
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
              Loading...
            </div>
          ) : (
            <>
              {activeTab === "queue" && (
                <div className="space-y-6">
                  {requests.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl border border-gray-100">
                      <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      All caught up!
                    </div>
                  ) : (
                    Object.entries(groupRequestsByBookingDate(requests)).map(
                      ([dateLabel, groupReqs]) => (
                        <div key={dateLabel}>
                          <div className="flex items-center gap-2 mb-3 ml-1">
                            <CalendarClock
                              size={16}
                              className="text-orange-500"
                            />
                            <h3 className="text-sm font-bold text-gray-500 uppercase">
                              {dateLabel}
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {groupReqs.map((req) => (
                              <div
                                key={req.id}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                    {req.status === "assigned" ? (
                                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                                        ASSIGNED
                                      </span>
                                    ) : (
                                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">
                                        PENDING
                                      </span>
                                    )}

                                    {/* --- PAYMENT STATUS BADGE --- */}
                                    {req.payment_status === "Paid" ? (
                                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-green-200">
                                        <DollarSign size={10} /> PAID
                                      </span>
                                    ) : (
                                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-red-200">
                                        <AlertTriangle size={10} /> UNPAID
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    #{req.id}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  <div className="text-sm text-gray-700 font-medium flex items-center gap-2">
                                    <User size={14} className="text-gray-400" />{" "}
                                    {req.user_full_name}
                                  </div>
                                  <div className="text-sm text-gray-700 font-medium flex items-center gap-2">
                                    <Package
                                      size={14}
                                      className="text-gray-400"
                                    />{" "}
                                    {req.waste_type} ({req.quantity})
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2 col-span-2">
                                    <MapPin
                                      size={14}
                                      className="text-gray-400"
                                    />{" "}
                                    {req.center_name}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2 col-span-2">
                                    {/* THIS WAS CAUSING THE ERROR IF IMPORT MISSING */}
                                    <Calendar
                                      size={14}
                                      className="text-gray-400"
                                    />{" "}
                                    {new Date(
                                      req.scheduled_date,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {req.status === "pending" && (
                                    <button
                                      onClick={() => openAssignModal(req)}
                                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700"
                                    >
                                      Assign Driver
                                    </button>
                                  )}
                                  {req.status === "collected" && (
                                    <button
                                      onClick={() =>
                                        handleVerifyRequest(req.id)
                                      }
                                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700"
                                    >
                                      Verify & Complete
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleRejectRequest(req.id)}
                                    className="px-4 border border-red-100 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )
                  )}
                </div>
              )}

              {/* HISTORY TAB */}
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
                        className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center opacity-75"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            {req.status === "verified" ? (
                              <CheckCircle
                                size={14}
                                className="text-green-600"
                              />
                            ) : (
                              <XCircle size={14} className="text-red-600" />
                            )}
                            <span className="font-bold text-sm text-gray-700">
                              {req.waste_type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {req.user_full_name} •{" "}
                            {new Date(req.scheduled_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {req.status === "verified" ? (
                            <span className="text-green-700 text-xs font-bold bg-green-100 px-2 py-1 rounded">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="text-red-700 text-xs font-bold bg-red-100 px-2 py-1 rounded">
                              REJECTED
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COL: MANUAL */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <RefreshCw size={18} className="text-gray-500" /> Manual Entry
            </h2>
            <form onSubmit={handleManualVerify} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 ring-green-500"
                  placeholder="resident@email.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Type
                </label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="Plastic">Plastic (20pts)</option>
                  <option value="Glass">Glass (15pts)</option>
                  <option value="Paper">Paper (10pts)</option>
                  <option value="Metal">Metal (30pts)</option>
                  <option value="Electronics">Electronics (50pts)</option>
                </select>
              </div>
              <button
                disabled={manualLoading}
                className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-black"
              >
                {manualLoading ? "Processing..." : "Confirm Drop-off"}
              </button>
            </form>
          </div>
          {lastSuccess && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={16} className="text-yellow-500" />
                <span className="font-bold text-green-900">Success!</span>
              </div>
              <p className="text-sm text-green-700">{lastSuccess.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
