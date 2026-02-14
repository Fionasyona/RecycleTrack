import {
  AlertCircle,
  Archive,
  CalendarClock,
  CheckCircle,
  LayoutDashboard,
  Loader,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  RefreshCw,
  Scale,
  ShieldCheck,
  TrendingUp,
  Truck,
  User,
  Wallet,
  X,
  Phone,
  Mail,
  Coins,
  Building2, // Added for Center display
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const CollectorDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("active");
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);

  const [wallet, setWallet] = useState({
    total_earned: 0,
    pending_amount: 0,
    transactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);

  const NAIROBI_CENTER = [-1.2921, 36.8219];

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Jobs
      try {
        const jobRes = await api.get("/users/collector/jobs/");
        const jobData = jobRes.data ? jobRes.data : jobRes;
        setJobs(Array.isArray(jobData) ? jobData : []);
      } catch (err) {
        console.error("Jobs Error", err);
      }

      // 2. History
      try {
        const histRes = await api.get("/users/collector/history/");
        const histData = histRes.data ? histRes.data : histRes;
        setHistory(Array.isArray(histData) ? histData : []);
      } catch (err) {
        console.error("History Error", err);
      }

      // 3. Wallet
      try {
        const walletRes = await api.get("/users/driver/wallet/");
        const walletData = walletRes.data || walletRes;
        if (walletData) {
          setWallet({
            total_earned: walletData.total_earned || 0,
            pending_amount: walletData.pending_amount || 0,
            transactions: Array.isArray(walletData.transactions)
              ? walletData.transactions
              : [],
          });
        }
      } catch (err) {
        console.error("Wallet Error", err);
      }

      // 4. Profile
      try {
        const profileRes = await api.get("/users/profile/");
        setDriverProfile(profileRes.data || profileRes);
      } catch (err) {
        console.error("Profile Error", err);
      }
    } catch (error) {
      console.error("Global Fetch Error", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openGoogleMaps = (lat, lng) => {
    if (!lat || !lng) return toast.error("Coordinates not available");
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const handleBillUser = async (id) => {
    const weightStr = window.prompt(
      "Enter the actual weight collected (KG):",
      "0",
    );
    if (!weightStr) return;
    const weight = parseFloat(weightStr);
    if (isNaN(weight) || weight <= 0)
      return toast.error("Please enter a valid weight");

    try {
      const toastId = toast.loading("Sending bill...");
      await api.patch(`/users/driver/bill-job/${id}/`, { weight });
      toast.success("Bill sent!", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error("Failed to submit bill");
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
      const dateStr = new Date(
        item.assigned_at || item.created_at,
      ).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  };

  const calculateEarnings = (billed_amount) => {
    const bill = parseFloat(billed_amount) || 0;
    return 100 + bill * 0.2;
  };

  const lifetimePayout = useMemo(() => {
    if (!history || !Array.isArray(history)) return 0;
    return history.reduce((total, job) => {
      const bill = parseFloat(job.billed_amount) || 0;
      return total + (100 + bill * 0.2);
    }, 0);
  }, [history]);

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
      {/* SIDEBAR */}
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
                <p
                  className={`text-xs font-medium ${driverProfile?.driver_profile?.is_verified ? "text-green-400" : "text-orange-400"}`}
                >
                  {driverProfile?.driver_profile?.is_verified
                    ? "Verified Driver"
                    : "Pending Verification"}
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <SidebarItem
              id="active"
              label="Active Tasks"
              icon={LayoutDashboard}
            />
            <SidebarItem id="wallet" label="Wallet & Earnings" icon={Wallet} />
            <SidebarItem id="history" label="Job History" icon={Archive} />
            <SidebarItem id="profile" label="My Profile" icon={User} />
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              {activeTab === "active"
                ? "Active Assignments"
                : activeTab === "wallet"
                  ? "My Wallet"
                  : activeTab === "history"
                    ? "Job History"
                    : "My Profile"}
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
                {/* ACTIVE TAB */}
                {activeTab === "active" && (
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
                                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                    <tr>
                                      <th className="p-4">
                                        Customer & Location
                                      </th>
                                      <th className="p-4">
                                        Waste & Destination
                                      </th>
                                      <th className="p-4">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {dateJobs.map((job) => (
                                      <tr
                                        key={job.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                      >
                                        <td className="p-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                              {job.user_full_name?.[0]}
                                            </div>
                                            <div>
                                              <p className="font-bold text-gray-900 text-sm">
                                                {job.user_full_name}
                                              </p>
                                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <MapPin size={10} />{" "}
                                                {job.pickup_address ||
                                                  job.region}
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="p-4">
                                          <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded w-fit">
                                              {job.waste_type} ({job.quantity}
                                              kg)
                                            </span>
                                            {/* --- RECYCLING CENTER INFO --- */}
                                            <div className="flex flex-col bg-green-50 p-2 rounded-lg border border-green-100">
                                              <div className="flex items-center gap-1.5 text-[11px] text-green-700 font-bold">
                                                <Building2 size={12} />
                                                <span>
                                                  {job.center_name ||
                                                    "Assigned Center"}
                                                </span>
                                              </div>
                                              <p className="text-[10px] text-green-600/70 truncate pl-4">
                                                {job.center_address ||
                                                  "Nairobi, Kenya"}
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="p-4">
                                          <div className="flex gap-2">
                                            {/* Route to Resident */}
                                            <button
                                              onClick={() =>
                                                openGoogleMaps(
                                                  job.latitude,
                                                  job.longitude,
                                                )
                                              }
                                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                              title="Route to Resident"
                                            >
                                              <Navigation size={18} />
                                            </button>

                                            {/* Route to Recycling Center */}
                                            <button
                                              onClick={() =>
                                                openGoogleMaps(
                                                  job.center_latitude,
                                                  job.center_longitude,
                                                )
                                              }
                                              className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                              title="Route to Recycling Center"
                                            >
                                              <Building2 size={18} />
                                            </button>

                                            {job.status === "assigned" && (
                                              <button
                                                onClick={() =>
                                                  handleBillUser(job.id)
                                                }
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-shadow shadow-md"
                                              >
                                                Weigh
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
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

                {/* WALLET TAB */}
                {activeTab === "wallet" && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Wallet className="text-green-600" size={24} />
                          </div>
                          <span className="bg-green-100 text-xs font-bold px-2 py-1 rounded text-green-700">
                            Available
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium mb-1">
                          Current Balance
                        </p>
                        <h2 className="text-3xl font-bold text-gray-800">
                          KES {wallet.total_earned}
                        </h2>
                      </div>

                      <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Coins className="text-white" size={24} />
                          </div>
                          <span className="bg-green-800/50 text-xs font-bold px-2 py-1 rounded text-green-100">
                            Lifetime
                          </span>
                        </div>
                        <p className="text-green-100 text-sm font-medium mb-1">
                          Total Driver Payout
                        </p>
                        <h2 className="text-3xl font-bold">
                          KES {lifetimePayout.toFixed(2)}
                        </h2>
                        <p className="text-xs text-green-200 mt-2 opacity-80">
                          Base (100) + 20% Commission
                        </p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <AlertCircle
                              className="text-orange-600"
                              size={24}
                            />
                          </div>
                          <span className="bg-orange-100 text-xs font-bold px-2 py-1 rounded text-orange-600">
                            Processing
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium mb-1">
                          Pending Clearance
                        </p>
                        <h2 className="text-3xl font-bold text-gray-800">
                          KES {wallet.pending_amount}
                        </h2>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6 border-b border-gray-100">
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
                              <th className="p-4">Earnings</th>
                              <th className="p-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {wallet.transactions?.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="p-8 text-center text-gray-400 italic"
                                >
                                  No payments yet.
                                </td>
                              </tr>
                            ) : (
                              wallet.transactions?.map((txn) => (
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
                                      {txn.id === "MIGRATE"
                                        ? "Balance Adjustment"
                                        : `Pickup #${txn.id}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {txn.waste_type} - {txn.region}
                                    </p>
                                  </td>
                                  <td className="p-4 text-green-600 font-bold">
                                    + KES{" "}
                                    {txn.id === "MIGRATE"
                                      ? txn.billed_amount
                                      : calculateEarnings(
                                          txn.billed_amount,
                                        ).toFixed(2)}
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

                {/* JOB HISTORY TAB */}
                {activeTab === "history" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    {history.length === 0 ? (
                      <div className="text-center p-12 text-gray-400 italic bg-white rounded-2xl border border-gray-100">
                        No completed jobs yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {history.map((job) => {
                          const dateObj = new Date(job.scheduled_date);
                          return (
                            <div
                              key={job.id}
                              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"
                            >
                              <div className="flex flex-col items-center justify-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 min-w-[70px]">
                                <span className="text-xs font-bold text-gray-400 uppercase">
                                  {dateObj.toLocaleString("default", {
                                    month: "short",
                                  })}
                                </span>
                                <span className="text-xl font-bold text-gray-800 leading-none mt-1">
                                  {dateObj.getDate()}
                                </span>
                              </div>
                              <div className="flex-1 border-l border-gray-100 pl-4">
                                <h4 className="font-bold text-gray-900 text-base">
                                  {job.user_full_name}
                                </h4>
                                <div className="flex flex-col gap-1 mt-1">
                                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                    <MapPin size={12} />{" "}
                                    <span>From: {job.region}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                                    <Building2 size={12} />{" "}
                                    <span>
                                      Delivered to:{" "}
                                      {job.center_name || "Assigned Center"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                    <Scale size={12} /> {job.actual_quantity} kg
                                  </span>
                                  <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">
                                    {job.waste_type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === "profile" && driverProfile && (
                  <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-green-700 h-32 relative">
                        <div className="absolute -bottom-12 left-8">
                          <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-3xl">
                              {driverProfile.first_name?.[0] || "D"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-16 pb-8 px-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              {driverProfile.first_name}{" "}
                              {driverProfile.last_name}
                            </h2>
                            <p className="text-gray-500 flex items-center gap-1">
                              <Truck size={14} /> Service Provider
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${driverProfile.driver_profile?.is_verified ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
                          >
                            {driverProfile.driver_profile?.is_verified
                              ? "Verified Driver"
                              : "Pending Verification"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 border-b pb-2">
                              Contact Details
                            </h3>
                            <div className="flex items-center gap-3 text-gray-600">
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <Mail size={18} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">
                                  Email Address
                                </p>
                                <p className="font-medium">
                                  {driverProfile.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <Phone size={18} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">
                                  Phone Number
                                </p>
                                <p className="font-medium">
                                  {driverProfile.phone || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 border-b pb-2">
                              Driver Stats
                            </h3>
                            <div className="flex items-center gap-3 text-gray-600">
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <Wallet size={18} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">
                                  Total Earned
                                </p>
                                <p className="font-medium">
                                  KES {wallet.total_earned}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <Archive size={18} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">
                                  Total Jobs
                                </p>
                                <p className="font-medium">
                                  {history.length} Completed
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-blue-600" />{" "}
                            Legal Documents
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                                National ID
                              </p>
                              <p className="font-mono text-gray-800 font-medium">
                                {driverProfile.driver_profile?.id_no ||
                                  "Not Submitted"}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                                Driving License
                              </p>
                              <p className="font-mono text-gray-800 font-medium">
                                {driverProfile.driver_profile?.license_no ||
                                  "Not Submitted"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
