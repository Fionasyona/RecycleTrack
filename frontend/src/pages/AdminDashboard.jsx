import {
  Archive,
  BarChart3,
  Calendar,
  CalendarClock,
  CheckCircle,
  CheckCheck,
  Clock,
  DollarSign,
  Eye,
  Loader,
  Map,
  MapPin,
  Navigation,
  Phone,
  PieChart,
  RefreshCw,
  Scale,
  ShieldCheck,
  Smartphone,
  Store,
  TrendingUp,
  Trophy,
  Truck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, centerAPI } from "../services/api";

const AdminDashboard = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("queue");

  // Withdrawal Sub-tab State
  const [withdrawalTab, setWithdrawalTab] = useState("pending"); // 'pending' | 'approved'

  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [collectors, setCollectors] = useState([]);

  // Withdrawal Data
  const [withdrawals, setWithdrawals] = useState([]); // Pending withdrawals
  const [approvedWithdrawals, setApprovedWithdrawals] = useState([]); // Approved withdrawals

  const [allUsers, setAllUsers] = useState([]);
  const [allCenters, setAllCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Verify State
  const [manualEmail, setManualEmail] = useState("");
  const [manualType, setManualType] = useState("Plastic");
  const [manualLoading, setManualLoading] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(null);

  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCollector, setSelectedCollector] = useState("");

  // --- VIEW DETAILS MODAL STATE ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedDetailUser, setSelectedDetailUser] = useState(null);
  const [selectedDetailCenter, setSelectedDetailCenter] = useState(null);

  // 1. FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        reqRes,
        colRes,
        histRes,
        withRes,
        approvedWithRes,
        usersRes,
        centersRes,
      ] = await Promise.all([
        api.get("/users/pickup/pending/"),
        api.get("/users/admin/collectors/"),
        api.get("/users/admin/history/"),
        api.get("/users/custom-admin/withdrawals/pending/"),
        api.get("/users/custom-admin/withdrawals/approved/"), // Fetch approved history
        api.get("/users/users/"),
        centerAPI.getAll(),
      ]);

      const extractData = (res) => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.results && Array.isArray(res.results)) return res.results;
        return [];
      };

      setRequests(extractData(reqRes));
      setCollectors(extractData(colRes));
      setHistory(extractData(histRes));
      setWithdrawals(extractData(withRes));
      setApprovedWithdrawals(extractData(approvedWithRes));
      setAllUsers(extractData(usersRes));
      setAllCenters(extractData(centersRes));
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      toast.error("Error loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---
  const handleVerifyRequest = async (requestId) => {
    const toastId = toast.loading("Verifying pickup...");
    try {
      await api.post(`/users/pickup/verify/${requestId}/`);
      toast.success("Verified! Driver Paid & User Awarded.", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Verification failed", {
        id: toastId,
      });
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

  const openDetailsModal = (req) => {
    setSelectedDetail(req);

    // Find User (For Phone Number)
    const fullUser = allUsers.find(
      (u) =>
        u.id === req.user_id || u.id === req.user || u.email === req.user_email,
    );
    setSelectedDetailUser(fullUser || null);

    // Find Center (Extremely Aggressive Matching)
    const foundCenter = allCenters.find((c) => {
      if (req.center && c.id == req.center) return true;
      if (req.center_id && c.id == req.center_id) return true;
      if (req.recycling_center && c.id == req.recycling_center) return true;
      if (req.center_name && c.name === req.center_name) return true;
      if (typeof req.center === "string" && c.name === req.center) return true;
      return false;
    });
    setSelectedDetailCenter(foundCenter || null);

    setShowDetailsModal(true);
  };

  // --- WITHDRAWAL ACTIONS ---
  const handleApproveWithdrawal = async (id, amount) => {
    if (!window.confirm(`Approve withdrawal of KES ${amount}?`)) return;
    const toastId = toast.loading("Processing payout...");
    try {
      const res = await api.post(
        `/users/custom-admin/withdrawals/${id}/approve/`,
      );
      toast.success("Withdrawal Approved & Paid!", { id: toastId });

      // Optimistically move from Pending to Approved locally
      const approvedItem = withdrawals.find((w) => w.id === id);
      if (approvedItem) {
        setWithdrawals((prev) => prev.filter((req) => req.id !== id));
        setApprovedWithdrawals((prev) => [
          { ...approvedItem, status: "approved", ...res.data },
          ...prev,
        ]);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Approval failed.", {
        id: toastId,
      });
    }
  };

  const handleRejectWithdrawal = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return;
    const toastId = toast.loading("Rejecting request...");
    try {
      await api.post(`/users/custom-admin/withdrawals/${id}/reject/`, {
        reason,
      });
      toast.success("Request rejected. Points refunded.", { id: toastId });
      setWithdrawals((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      toast.error("Rejection failed.", { id: toastId });
    }
  };

  // --- MANUAL VERIFY ---
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
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error verifying user.");
    } finally {
      setManualLoading(false);
    }
  };

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

  const getDriverName = (collectorId) => {
    const driver = collectors.find((c) => c.id === collectorId);
    return driver ? driver.full_name : "Unknown Driver";
  };

  // --- FINANCIAL CALCULATIONS ---
  const totalRevenue = history.reduce(
    (acc, curr) => acc + (parseFloat(curr.billed_amount) || 0),
    0,
  );

  const totalDriverPayouts = history.reduce((acc, curr) => {
    const bill = parseFloat(curr.billed_amount) || 0;
    return acc + (100 + bill * 0.2);
  }, 0);

  const wasteStats = history.reduce((acc, curr) => {
    const type = curr.waste_type || "Other";
    const weight = parseFloat(curr.actual_quantity) || 0;
    if (!acc[type]) acc[type] = 0;
    acc[type] += weight;
    return acc;
  }, {});

  const totalWeightRecycled = Object.values(wasteStats).reduce(
    (a, b) => a + b,
    0,
  );

  const driverStats = collectors
    .map((driver) => {
      const driverJobs = history.filter((h) => h.collector === driver.id);
      const earnings = driverJobs.reduce((acc, job) => {
        const bill = parseFloat(job.billed_amount) || 0;
        return acc + (100 + bill * 0.2);
      }, 0);
      return {
        name: driver.full_name,
        jobs: driverJobs.length,
        earnings: earnings,
      };
    })
    .sort((a, b) => b.earnings - a.earnings);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 relative">
      {/* --- VIEW DETAILS MODAL --- */}
      {showDetailsModal && selectedDetail && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-green-800 p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-green-300" />
                  Request #{selectedDetail.id}
                </h3>
                <p className="text-green-100 text-sm mt-1 opacity-80">
                  Detailed view of pickup request
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={14} /> User Profile Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Full Name
                    </p>
                    <p className="text-gray-900 font-bold text-lg">
                      {selectedDetailUser?.full_name ||
                        selectedDetail.user_full_name ||
                        "Guest User"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Phone Number
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedDetailUser?.phone ||
                          selectedDetail.user_phone ||
                          "No Number Available"}
                      </p>
                      {(selectedDetailUser?.phone ||
                        selectedDetail.user_phone) && (
                        <a
                          href={`tel:${
                            selectedDetailUser?.phone ||
                            selectedDetail.user_phone
                          }`}
                          className="bg-green-500 text-white p-1.5 rounded-full hover:bg-green-600 shadow-sm"
                          title="Call Now"
                        >
                          <Phone size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Truck size={14} /> Pickup Details (User Input)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                      <RefreshCw size={10} /> Waste Type
                    </p>
                    <p className="text-gray-800 font-bold text-lg">
                      {selectedDetail.waste_type}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                      <Calendar size={10} /> Scheduled Date
                    </p>
                    <p className="text-gray-800 font-bold text-lg">
                      {selectedDetail.scheduled_date
                        ? new Date(selectedDetail.scheduled_date).toDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl col-span-1 md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                      <Store size={10} /> Preferred Recycling Center
                    </p>
                    <p className="text-blue-800 font-bold text-lg">
                      {selectedDetailCenter?.name ||
                        selectedDetail.center_name ||
                        selectedDetail.center ||
                        "Any Available Center"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                      <Map size={10} /> Region / Area
                    </p>
                    <p className="text-gray-800 font-bold">
                      {selectedDetail.region || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                      <MapPin size={10} /> Street / Landmark
                    </p>
                    <p className="text-gray-800 font-bold">
                      {selectedDetail.pickup_address || "Pinned Location"}
                    </p>
                  </div>
                  {selectedDetail.latitude && selectedDetail.longitude && (
                    <div className="col-span-1 md:col-span-2 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-700 uppercase font-bold mb-1 flex items-center gap-1">
                          <Navigation size={10} /> GPS Coordinates
                        </p>
                        <p className="text-green-900 font-mono text-sm">
                          {selectedDetail.latitude}, {selectedDetail.longitude}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${selectedDetail.latitude},${selectedDetail.longitude}`,
                            "_blank",
                          )
                        }
                        className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition shadow-sm"
                      >
                        Open Maps
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-5 border-t border-gray-200 shrink-0 flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
              >
                Close
              </button>
              {selectedDetail.status === "pending" && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openAssignModal(selectedDetail);
                  }}
                  className="flex-1 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 shadow-lg shadow-green-200 transition"
                >
                  Assign Driver
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ASSIGNMENT MODAL --- */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Assign Driver
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Select a driver for {selectedRequest.waste_type} pickup.
            </p>
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
              Active Pickups
            </p>
            <p className="text-xl md:text-2xl font-bold">{requests.length}</p>
          </div>
          <div className="bg-green-900/50 px-4 py-3 rounded-xl border border-green-700 text-center">
            <p className="text-[10px] md:text-xs text-green-200 uppercase tracking-wider font-bold">
              Pending Payouts
            </p>
            <p className="text-xl md:text-2xl font-bold">
              {withdrawals.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* TABS */}
          <div className="flex justify-between items-end border-b border-gray-200 pb-1 overflow-x-auto">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("queue")}
                className={`flex items-center gap-2 pb-2 px-2 font-bold whitespace-nowrap ${
                  activeTab === "queue"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Clock size={18} /> Active Queue
              </button>

              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`flex items-center gap-2 pb-2 px-2 font-bold whitespace-nowrap ${
                  activeTab === "withdrawals"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Wallet size={18} /> Withdrawals
                {withdrawals.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {withdrawals.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 pb-2 px-2 font-bold whitespace-nowrap ${
                  activeTab === "history"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Archive size={18} /> History
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-2 pb-2 px-2 font-bold whitespace-nowrap ${
                  activeTab === "analytics"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <BarChart3 size={18} /> Analytics
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
                                    ) : req.status === "collected" ? (
                                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                        <Scale size={10} /> WEIGHED
                                      </span>
                                    ) : (
                                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">
                                        PENDING
                                      </span>
                                    )}
                                    {req.billed_amount > 0 &&
                                      (req.is_paid ? (
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-green-200">
                                          <DollarSign size={10} /> PAID:{" "}
                                          {req.billed_amount}
                                        </span>
                                      ) : (
                                        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-yellow-200">
                                          <Clock size={10} /> BILL SENT:{" "}
                                          {req.billed_amount}
                                        </span>
                                      ))}
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
                                    <Truck
                                      size={14}
                                      className={
                                        req.collector
                                          ? "text-blue-500"
                                          : "text-gray-300"
                                      }
                                    />
                                    {req.collector ? (
                                      <span className="text-blue-600 font-bold">
                                        {getDriverName(req.collector)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 italic">
                                        No Driver
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2 col-span-2">
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
                                  <button
                                    onClick={() => openDetailsModal(req)}
                                    className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 border border-gray-200 transition"
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  {req.status === "pending" && (
                                    <button
                                      onClick={() => openAssignModal(req)}
                                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700"
                                    >
                                      Assign Driver
                                    </button>
                                  )}
                                  {req.status === "collected" &&
                                    (req.is_paid ? (
                                      <button
                                        onClick={() =>
                                          handleVerifyRequest(req.id)
                                        }
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center justify-center gap-1"
                                      >
                                        <CheckCircle size={14} /> Verify & Pay
                                        Driver
                                      </button>
                                    ) : (
                                      <div className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-lg text-xs font-bold text-center border border-gray-200 cursor-not-allowed">
                                        Waiting for User Payment...
                                      </div>
                                    ))}
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

              {activeTab === "withdrawals" && (
                <div className="space-y-4 animate-fade-in">
                  {/* --- WITHDRAWAL SUB-TABS --- */}
                  <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl w-fit mb-2">
                    <button
                      onClick={() => setWithdrawalTab("pending")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        withdrawalTab === "pending"
                          ? "bg-white text-gray-800 shadow-sm ring-1 ring-black/5"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Pending ({withdrawals.length})
                    </button>
                    <button
                      onClick={() => setWithdrawalTab("approved")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        withdrawalTab === "approved"
                          ? "bg-white text-green-700 shadow-sm ring-1 ring-black/5"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Approved ({approvedWithdrawals.length})
                    </button>
                  </div>

                  {withdrawalTab === "pending" ? (
                    // --- PENDING LIST ---
                    withdrawals.length === 0 ? (
                      <div className="text-center p-12 bg-white rounded-xl border border-gray-100">
                        <CheckCircle className="w-10 h-10 text-green-200 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">
                          No Pending Requests
                        </h3>
                        <p className="text-gray-500">
                          All withdrawal requests have been processed.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                            <tr>
                              <th className="p-4 font-semibold">User</th>
                              <th className="p-4 font-semibold">Amount</th>
                              <th className="p-4 font-semibold hidden md:table-cell">
                                Phone
                              </th>
                              <th className="p-4 font-semibold text-right">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {withdrawals.map((req) => (
                              <tr
                                key={req.id}
                                className="hover:bg-gray-50 transition"
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                      <User size={14} />
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900">
                                        {req.user_name || "Resident"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {req.user_email}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="font-bold text-gray-900">
                                    KES {req.amount}
                                  </p>
                                  <p className="text-xs text-orange-500 font-medium">
                                    -{req.points_used} pts
                                  </p>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Smartphone
                                      size={14}
                                      className="text-gray-400"
                                    />
                                    <span className="font-mono">
                                      {req.mpesa_number}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                  <button
                                    onClick={() =>
                                      handleRejectWithdrawal(req.id)
                                    }
                                    className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleApproveWithdrawal(
                                        req.id,
                                        req.amount,
                                      )
                                    }
                                    className="px-3 py-1.5 text-white bg-green-600 hover:bg-green-700 rounded-lg text-xs font-bold shadow-sm transition inline-flex items-center gap-1"
                                  >
                                    <CheckCircle size={14} /> Pay
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : // --- APPROVED LIST ---
                  approvedWithdrawals.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl border border-gray-100">
                      <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">
                        No Approved History
                      </h3>
                      <p className="text-gray-500">
                        No past withdrawals found.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                          <tr>
                            <th className="p-4 font-semibold">User</th>
                            <th className="p-4 font-semibold">Amount Paid</th>
                            <th className="p-4 font-semibold hidden md:table-cell">
                              Phone
                            </th>
                            <th className="p-4 font-semibold text-right">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {approvedWithdrawals.map((req) => (
                            <tr
                              key={req.id}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                                    <User size={14} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">
                                      {req.user_name || "Resident"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {req.user_email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-gray-900">
                                  KES {req.amount}
                                </p>
                                <p className="text-xs text-green-600 font-medium">
                                  Paid Out
                                </p>
                              </td>
                              <td className="p-4 hidden md:table-cell">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Smartphone
                                    size={14}
                                    className="text-gray-400"
                                  />
                                  <span className="font-mono">
                                    {req.mpesa_number}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                  <CheckCheck size={12} /> Approved
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

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

              {/* ANALYTICS TAB */}
              {activeTab === "analytics" && (
                <div className="space-y-8 animate-fade-in">
                  {/* Financials Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gross Revenue Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Total Income
                          </p>
                          <h3 className="text-2xl font-black text-gray-800 mt-1">
                            KES {totalRevenue.toLocaleString()}
                          </h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <TrendingUp size={20} />
                        </div>
                      </div>
                      <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded inline-block">
                        +100% Verified Bills
                      </div>
                    </div>

                    {/* Operational Spending Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Driver Payouts
                          </p>
                          <h3 className="text-2xl font-black text-gray-800 mt-1">
                            KES {totalDriverPayouts.toLocaleString()}
                          </h3>
                        </div>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                          <Truck size={20} />
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Operational Cost (Base + Comm.)
                      </div>
                    </div>

                    {/* Net Profit Card */}
                    <div className="bg-gradient-to-br from-green-700 to-green-900 p-6 rounded-2xl text-white shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-green-200 font-bold uppercase tracking-wider">
                            Net Profit
                          </p>
                          <h3 className="text-3xl font-black mt-1">
                            KES{" "}
                            {(
                              totalRevenue - totalDriverPayouts
                            ).toLocaleString()}
                          </h3>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg">
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-green-200 opacity-80">
                        *Excludes User Reward Withdrawals
                      </p>
                    </div>
                  </div>

                  {/* Waste Composition Section */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <PieChart size={18} className="text-blue-500" /> Waste
                      Composition (Recycled)
                    </h3>

                    <div className="space-y-5">
                      {Object.keys(wasteStats).length === 0 ? (
                        <p className="text-gray-400 italic text-center py-8">
                          No recycling data yet.
                        </p>
                      ) : (
                        Object.entries(wasteStats).map(([type, weight]) => {
                          const percentage =
                            (weight / totalWeightRecycled) * 100;
                          const colors = {
                            Plastic: "bg-yellow-400",
                            Glass: "bg-green-400",
                            Paper: "bg-blue-400",
                            Metal: "bg-gray-400",
                            "E-waste": "bg-red-400",
                            Organic: "bg-green-600",
                          };
                          const barColor = colors[type] || "bg-green-600";

                          return (
                            <div key={type}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-gray-700">
                                  {type}
                                </span>
                                <span className="font-bold text-gray-900">
                                  {weight.toFixed(2)} kg
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-2.5 rounded-full ${barColor}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 text-right">
                                {percentage.toFixed(1)}% of total
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COL: SIDEBAR CONTENT */}
        <div className="space-y-6">
          {activeTab === "analytics" ? (
            /* SHOW TOP PERFORMERS ONLY IN ANALYTICS */
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" /> Top Performers
              </h3>
              <div className="space-y-4">
                {driverStats.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    No driver data.
                  </p>
                ) : (
                  driverStats.slice(0, 5).map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          i === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-bold text-gray-800 text-sm truncate"
                          title={d.name}
                        >
                          {d.name}
                        </p>
                        <div className="flex justify-between items-center mt-0.5">
                          <p className="text-xs text-gray-500">{d.jobs} Jobs</p>
                          <p className="text-xs font-bold text-green-600 whitespace-nowrap">
                            KES{" "}
                            {d.earnings.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* SHOW MANUAL ENTRY IN ALL OTHER TABS */
            <>
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
                      <option value="E-waste">E-waste (50pts)</option>
                      <option value="Organic">Organic (25pts)</option>
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
                  <p className="text-sm text-green-700">
                    {lastSuccess.message}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
