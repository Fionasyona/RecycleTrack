import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Truck,
  MapPin,
  CheckCircle,
  Package,
  User,
  LogOut,
  Loader,
  RefreshCw,
  Clock,
  Archive,
  Navigation,
  Calendar,
  CalendarClock,
  Menu,
  X,
  LayoutDashboard,
  Wallet, // New Icon
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";

const CollectorDashboard = () => {
  const { user, logout } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState("active");
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);
  const [wallet, setWallet] = useState({
    total_earned: 0,
    pending_amount: 0,
    transactions: [],
  }); // Wallet State
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Verification State (from previous step)
  const [driverProfile, setDriverProfile] = useState(null);

  const NAIROBI_CENTER = [-1.2921, 36.8219];

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Jobs
      const jobRes = await api.get("/users/collector/jobs/");
      setJobs(Array.isArray(jobRes) ? jobRes : jobRes.data || []);

      // 2. Fetch History
      const histRes = await api.get("/users/collector/history/");
      setHistory(Array.isArray(histRes) ? histRes : histRes.data || []);

      // 3. Fetch Wallet (NEW)
      const walletRes = await api.get("/users/driver/wallet/");
      setWallet(
        walletRes.data || {
          total_earned: 0,
          pending_amount: 0,
          transactions: [],
        },
      );

      // 4. Fetch Profile
      const profileRes = await api.get("/users/profile/");
      const profileData = profileRes.data || profileRes;
      setDriverProfile(profileData.driver_profile || {});
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPER FUNCTIONS ---
  const getJobCoordinates = (job) => {
    const lat = parseFloat(job.latitude);
    const lng = parseFloat(job.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    return NAIROBI_CENTER;
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank",
    );
  };

  const handleConfirm = async (id) => {
    if (!window.confirm("Confirm you have collected these items?")) return;
    try {
      await api.patch(`/users/collector/confirm/${id}/`);
      toast.success("Pickup Confirmed! Earnings moved to Pending.");
      fetchData(); // Refresh to update wallet pending status
    } catch (error) {
      toast.error("Failed to confirm pickup");
    }
  };

  const groupJobsByAssignmentDate = (items) => {
    const groups = {};
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.assigned_at || b.created_at) -
        new Date(a.assigned_at || a.created_at),
    );
    sorted.forEach((item) => {
      const dateRaw = item.assigned_at || item.created_at;
      const dateStr = new Date(dateRaw).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  };

  const SidebarItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
        activeTab === id
          ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
          : "text-gray-400 hover:bg-gray-700 hover:text-white"
      }`}
    >
      <Icon
        size={20}
        className={activeTab === id ? "fill-green-600 text-white" : ""}
      />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 1. SIDEBAR */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full text-white">
          <div className="h-16 flex items-center px-6 border-b border-gray-700">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <div className="p-1.5 bg-green-600 rounded-lg">
                <Truck className="text-white" size={20} />
              </div>
              <span>
                Driver<span className="text-gray-400 font-normal">Portal</span>
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden ml-auto text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 pb-2">
            <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-700 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-green-400 font-bold border border-gray-600">
                {user?.full_name?.[0] || "D"}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-200 text-sm truncate">
                  {user?.full_name || "Driver"}
                </p>
                <p className="text-xs text-green-400 font-medium">
                  Verified Driver
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-2 tracking-wider">
              Menu
            </div>
            <SidebarItem
              id="active"
              label="Active Tasks"
              icon={LayoutDashboard}
            />
            <SidebarItem id="wallet" label="Wallet & Earnings" icon={Wallet} />{" "}
            {/* NEW WALLET TAB */}
            <SidebarItem id="history" label="Job History" icon={Archive} />
          </nav>

          <div className="p-4 border-t border-gray-700 space-y-2 bg-gray-800">
            <button
              onClick={fetchData}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-xl transition-colors font-medium"
            >
              <RefreshCw size={20} /> Refresh
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-bold"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              {activeTab === "active" && (
                <>
                  <Clock className="text-green-600" size={20} /> Active
                  Assignments
                </>
              )}
              {activeTab === "wallet" && (
                <>
                  <Wallet className="text-green-600" size={20} /> My Wallet
                </>
              )}
              {activeTab === "history" && (
                <>
                  <Archive className="text-green-600" size={20} /> Job History
                </>
              )}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Loader className="w-10 h-10 animate-spin text-green-600 mb-4" />
                <p>Syncing data...</p>
              </div>
            ) : (
              <>
                {/* --- ACTIVE TAB --- */}
                {activeTab === "active" && (
                  // ... (Your Existing Active Tab Code)
                  <div className="space-y-8 animate-in fade-in duration-500">
                    {jobs.length === 0 ? (
                      <div className="text-center p-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                        <CheckCircle className="w-16 h-16 text-green-100 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-600">
                          All caught up!
                        </h3>
                        <p>No active pickup jobs assigned to you.</p>
                      </div>
                    ) : (
                      Object.entries(groupJobsByAssignmentDate(jobs)).map(
                        ([date, dateJobs]) => (
                          <div key={date}>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="bg-orange-100 text-orange-600 p-1.5 rounded-md">
                                <CalendarClock size={16} />
                              </span>
                              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                                Assigned: {date}
                              </h3>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                      <th className="p-4">Customer</th>
                                      <th className="p-4">Waste Info</th>
                                      <th className="p-4">Location</th>
                                      <th className="p-4">Pickup Date</th>
                                      <th className="p-4 text-center">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {dateJobs.map((job) => {
                                      const coords = getJobCoordinates(job);
                                      return (
                                        <tr
                                          key={job.id}
                                          className="hover:bg-gray-50/50 transition-colors"
                                        >
                                          <td className="p-4">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                {job.user_full_name?.[0]}
                                              </div>
                                              <div>
                                                <p className="font-bold text-gray-900 text-sm">
                                                  {job.user_full_name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                  #{job.id}
                                                </p>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                              <Package
                                                size={16}
                                                className="text-blue-500"
                                              />
                                              <span>{job.waste_type}</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 ml-6">
                                              {job.quantity}
                                            </span>
                                          </td>
                                          <td className="p-4">
                                            <div className="max-w-[200px]">
                                              <div className="flex items-start gap-1 text-sm text-gray-800">
                                                <MapPin
                                                  size={14}
                                                  className="text-red-500 mt-1 shrink-0"
                                                />
                                                <span className="truncate">
                                                  {job.region}
                                                </span>
                                              </div>
                                              <p className="text-xs text-gray-400 pl-5 truncate">
                                                {job.pickup_address ||
                                                  "No address"}
                                              </p>
                                            </div>
                                          </td>
                                          <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                              <Calendar
                                                size={14}
                                                className="text-orange-500"
                                              />
                                              {new Date(
                                                job.scheduled_date,
                                              ).toLocaleDateString()}
                                            </div>
                                          </td>
                                          <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                              <button
                                                onClick={() =>
                                                  openGoogleMaps(
                                                    coords[0],
                                                    coords[1],
                                                  )
                                                }
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                                title="Navigate"
                                              >
                                                <Navigation size={18} />
                                              </button>
                                              {job.status === "assigned" && (
                                                <button
                                                  onClick={() =>
                                                    handleConfirm(job.id)
                                                  }
                                                  className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                                                >
                                                  <CheckCircle size={14} />{" "}
                                                  Complete
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                )}

                {/* --- NEW: WALLET TAB --- */}
                {activeTab === "wallet" && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Wallet Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Available Balance */}
                      <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl text-white shadow-lg shadow-green-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Wallet className="text-white" size={24} />
                          </div>
                          <span className="bg-green-800/50 text-xs font-bold px-2 py-1 rounded text-green-100">
                            Available
                          </span>
                        </div>
                        <p className="text-green-100 text-sm font-medium mb-1">
                          Total Earned (Paid)
                        </p>
                        <h2 className="text-4xl font-bold">
                          KES {wallet.total_earned}
                        </h2>
                        <p className="text-xs text-green-200 mt-4 flex items-center gap-1">
                          <CheckCircle size={12} /> Verified by Admin
                        </p>
                      </div>

                      {/* Pending Balance */}
                      <div className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-10 -mt-10 z-0"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div className="bg-orange-100 p-2 rounded-lg">
                              <AlertCircle
                                className="text-orange-600"
                                size={24}
                              />
                            </div>
                            <span className="bg-orange-100 text-xs font-bold px-2 py-1 rounded text-orange-600">
                              Pending
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm font-medium mb-1">
                            Pending Clearance
                          </p>
                          <h2 className="text-4xl font-bold text-gray-800">
                            KES {wallet.pending_amount}
                          </h2>
                          <p className="text-xs text-orange-500 mt-4 flex items-center gap-1">
                            <Clock size={12} /> Waiting for Admin Verification
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Transaction History Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <TrendingUp className="text-blue-500" size={20} />{" "}
                          Payment History
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                            <tr>
                              <th className="p-4">Date</th>
                              <th className="p-4">Job Info</th>
                              <th className="p-4">Amount</th>
                              <th className="p-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {wallet.transactions.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="p-8 text-center text-gray-400 italic"
                                >
                                  No payments received yet.
                                </td>
                              </tr>
                            ) : (
                              wallet.transactions.map((txn) => (
                                <tr
                                  key={txn.id}
                                  className="hover:bg-gray-50 transition"
                                >
                                  <td className="p-4 text-sm text-gray-600 font-medium">
                                    {new Date(
                                      txn.scheduled_date,
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="p-4">
                                    <p className="text-sm font-bold text-gray-800">
                                      Pickup #{txn.id}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {txn.waste_type} - {txn.region}
                                    </p>
                                  </td>
                                  <td className="p-4 text-green-600 font-bold">
                                    + KES 200.00
                                  </td>
                                  <td className="p-4">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                      PAID
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- HISTORY TAB --- */}
                {activeTab === "history" && (
                  // ... (Your Existing History Code)
                  <div className="space-y-4 animate-in fade-in duration-500">
                    {history.length === 0 ? (
                      <div className="text-center p-12 text-gray-400 italic bg-white rounded-2xl border border-gray-100">
                        No completed jobs yet.
                      </div>
                    ) : (
                      history.map((job) => (
                        <div
                          key={job.id}
                          className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition shadow-sm opacity-75"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                              <CheckCircle size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {job.user_full_name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {job.waste_type} • {job.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase border border-green-200">
                            Verified
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CollectorDashboard;
