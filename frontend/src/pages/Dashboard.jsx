import {
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  History,
  MapPin,
  Medal,
  Scale,
  Trophy,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, centerAPI } from "../services/api";

const Dashboard = () => {
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(
    currentUser || {
      redeemable_points: 0,
      lifetime_points: 0,
      badge: "Newcomer",
      full_name: "Resident",
    },
  );
  const [centerCount, setCenterCount] = useState(0);
  const [leaders, setLeaders] = useState([]);
  const [activity, setActivity] = useState({ pending: [], history: [] });
  const [loading, setLoading] = useState(true);

  // --- HELPER: Process Data to Move Rejected items to History ---
  const processActivityData = (data) => {
    if (!data) return { pending: [], history: [] };

    const rawPending = data.pending || [];
    const rawHistory = data.history || [];

    // 1. Filter Pending: Keep only Active (Not cancelled/rejected)
    const activePending = rawPending.filter(
      (req) => req.status !== "cancelled",
    );

    // 2. Extract Rejected items
    const rejectedItems = rawPending.filter(
      (req) => req.status === "cancelled",
    );

    // 3. Format Rejected items to look like History items
    const formattedRejected = rejectedItems.map((req) => ({
      id: `rej-${req.id}`,
      waste_type: req.waste_type,
      // Use created_at or scheduled_date for the timestamp
      date: req.created_at || req.scheduled_date,
      points: 0,
      status: "Rejected", // Tag to identify in UI
      rejection_reason: req.rejection_reason,
    }));

    // 4. Merge Real History + Rejected Items & Sort by Date (Newest First)
    const combinedHistory = [...rawHistory, ...formattedRejected].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    return { pending: activePending, history: combinedHistory };
  };

  const getDisplayName = (userObj) => {
    if (userObj.full_name && userObj.full_name.trim() !== "")
      return userObj.full_name;
    if (userObj.first_name)
      return `${userObj.first_name} ${userObj.last_name || ""}`;
    if (userObj.email) return userObj.email.split("@")[0];
    return "Resident";
  };

  const getBadgeProgress = (points) => {
    const safePoints = points || 0;
    if (safePoints >= 2000)
      return { next: "Max Level", target: 2000, percent: 100 };
    if (safePoints >= 1000)
      return {
        next: "Recycle Legend",
        target: 2000,
        percent: (safePoints / 2000) * 100,
      };
    if (safePoints >= 500)
      return {
        next: "Planet Protector",
        target: 1000,
        percent: (safePoints / 1000) * 100,
      };
    if (safePoints >= 250)
      return {
        next: "Waste Warrior",
        target: 500,
        percent: (safePoints / 500) * 100,
      };
    if (safePoints >= 100)
      return {
        next: "Green Guardian",
        target: 250,
        percent: (safePoints / 250) * 100,
      };
    return {
      next: "Eco Starter",
      target: 100,
      percent: (safePoints / 100) * 100,
    };
  };

  const progress = getBadgeProgress(profile.lifetime_points);

  const getRankIcon = (index) => {
    if (index === 0)
      return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
    if (index === 1)
      return <Medal className="w-5 h-5 text-gray-400 fill-gray-400" />;
    if (index === 2)
      return <Medal className="w-5 h-5 text-orange-400 fill-orange-400" />;
    return (
      <span className="font-bold text-gray-400 text-sm">#{index + 1}</span>
    );
  };

  const groupPendingByBookingDate = (items) => {
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

  // --- UPDATED: Handle Withdrawal Request ---
  const handleWithdraw = async () => {
    const points = profile.redeemable_points || 0;
    const amount = (points * 0.3).toFixed(2); // Assuming 1 point = 0.3 KES

    // Validation: Minimum points required (e.g., 100 points)
    if (points < 100) {
      toast.error("You need at least 100 points to withdraw.");
      return;
    }

    // UPDATED: Confirmation message clarifies this is a REQUEST, not immediate
    if (
      !window.confirm(
        `Submit a request to withdraw KES ${amount}? \n\nThis requires Admin approval before funds are sent to your M-Pesa.`,
      )
    )
      return;

    const toastId = toast.loading("Submitting withdrawal request...");

    try {
      // NOTE: Ensure your backend creates a 'Pending' withdrawal record here
      await api.post("/users/withdraw/initiate/", {
        amount: amount,
        phone: profile.phone || currentUser.phone,
      });

      // UPDATED: Success message
      toast.success("Request sent! Pending Admin approval.", { id: toastId });

      // Refresh profile to update points balance (if backend deducts immediately)
      const profileRes = await api.get("/users/profile/");
      setProfile(profileRes.data || profileRes);
    } catch (error) {
      console.error("Withdraw Error", error);
      toast.error(error.response?.data?.error || "Request failed. Try again.", {
        id: toastId,
      });
    }
  };

  const handlePayment = async (pickupId, amount) => {
    const safeAmount = amount || 0;
    if (!window.confirm(`Pay KES ${safeAmount} for waste collection service?`))
      return;

    const toastId = toast.loading("Processing M-Pesa payment...");
    try {
      await api.post("/users/payment/initiate/", {
        pickup_id: pickupId,
        phone: profile.phone || currentUser.phone,
      });
      toast.success("Payment Received!", { id: toastId });
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || "Payment failed.", {
        id: toastId,
      });
    }
  };

  const fetchHistory = async () => {
    try {
      const historyRes = await api.get("/users/history/");
      const historyData = historyRes.pending ? historyRes : historyRes.data;
      // Process data to move rejected to history
      setActivity(processActivityData(historyData));
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centersRes, profileRes, leaderboardRes, historyRes] =
          await Promise.all([
            centerAPI.getAll(),
            api.get("/users/profile/"),
            api.get("/users/leaderboard/"),
            api.get("/users/history/"),
          ]);

        const centers = Array.isArray(centersRes)
          ? centersRes
          : centersRes.results || [];
        setCenterCount(centers.length);
        setProfile(profileRes.data || profileRes);
        setLeaders(
          Array.isArray(leaderboardRes.data)
            ? leaderboardRes.data
            : leaderboardRes,
        );

        const historyData = historyRes.pending ? historyRes : historyRes.data;
        // Process data using our new helper
        setActivity(processActivityData(historyData));
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mr-auto">
      {/* 1. HERO SECTION */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-yellow-400 text-green-900 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                {profile.badge || "Newcomer"}
              </span>
            </div>
            <h1 className="text-3xl font-bold">
              Hello, {getDisplayName(profile)}!
            </h1>
            <p className="text-green-50 opacity-90 mt-2">
              You have <strong>{profile.redeemable_points || 0} points</strong>{" "}
              available to redeem.
            </p>
          </div>

          <div className="w-full md:w-1/3 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>Next: {progress.next}</span>
              <span>
                {profile.lifetime_points || 0} / {progress.target} pts
              </span>
            </div>
            <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-yellow-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- UPDATED WALLET CARD --- */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Wallet Balance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.redeemable_points || 0}{" "}
                <span className="text-sm font-normal text-gray-400">pts</span>
              </p>
              <p className="text-xs text-green-600 font-bold mt-1">
                Worth KES {((profile.redeemable_points || 0) * 0.3).toFixed(2)}
              </p>
            </div>
          </div>

          {/* WITHDRAW BUTTON */}
          <button
            onClick={handleWithdraw}
            disabled={(profile.redeemable_points || 0) < 100} // Disable if less than 100 points
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
            title={
              (profile.redeemable_points || 0) < 100
                ? "Minimum 100 points required to withdraw"
                : "Request Withdrawal"
            }
          >
            <Wallet size={16} />
            Withdraw
          </button>
        </div>

        {/* ACTIVE CENTERS CARD */}
        <Link
          to="/maps"
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition group"
        >
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-200">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium group-hover:text-blue-600">
              Active Centers
            </p>
            <p className="text-2xl font-bold text-gray-900">{centerCount}</p>
          </div>
        </Link>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- LEFT COLUMN: LEADERBOARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Top Recyclers
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {Array.isArray(leaders) && leaders.length > 0 ? (
              leaders.slice(0, 5).map((player, index) => (
                <div
                  key={player.id || index}
                  className={`flex items-center justify-between p-4 ${currentUser?.email === player.email ? "bg-yellow-50 border-l-4 border-yellow-400" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-green-600"}`}
                      >
                        {getDisplayName(player)[0].toUpperCase()}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${currentUser?.email === player.email ? "text-green-800" : "text-gray-800"}`}
                        >
                          {getDisplayName(player)}{" "}
                          {currentUser?.email === player.email && "(You)"}
                        </p>
                        <p className="text-xs text-gray-400">{player.badge}</p>
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-gray-700">
                    {player.lifetime_points || 0}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      pts
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 italic">
                Leaderboard loading...
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: REQUESTS & HISTORY --- */}
        <div className="space-y-8">
          {/* Pickup Requests (NOW EXCLUDES REJECTED) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" /> Pickup Requests
            </h2>
            {activity.pending && activity.pending.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(
                  groupPendingByBookingDate(activity.pending),
                ).map(([dateLabel, groupReqs]) => (
                  <div key={dateLabel}>
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarClock size={14} className="text-orange-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        Booked on: {dateLabel}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupReqs.map((req) => {
                        const isVerified =
                          req.status === "verified" ||
                          req.status === "paid" ||
                          req.is_paid;
                        const isCollected = req.status === "collected";
                        const hasWeight = Number(req.actual_quantity) > 0;
                        const billAmount = Number(req.billed_amount) || 0;

                        return (
                          <div
                            key={req.id}
                            className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-orange-50 border-orange-100"
                          >
                            <div>
                              <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                                {req.waste_type}
                                {hasWeight ? (
                                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
                                    {req.actual_quantity} kg
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                    Pending Weighing
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                                <Calendar
                                  size={12}
                                  className="text-green-600"
                                />
                                <span>
                                  Scheduled:{" "}
                                  <b>
                                    {new Date(
                                      req.scheduled_date,
                                    ).toLocaleDateString()}
                                  </b>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {isVerified ? (
                                <span className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                                  <CheckCircle size={12} /> VERIFIED
                                </span>
                              ) : isCollected && !req.is_paid ? (
                                <button
                                  onClick={() =>
                                    handlePayment(req.id, billAmount)
                                  }
                                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 animate-pulse transition shadow-sm"
                                >
                                  <CreditCard size={12} />
                                  {billAmount > 0
                                    ? `Pay KES ${billAmount}`
                                    : "Pay Bill"}
                                </button>
                              ) : (
                                <span className="text-xs font-bold px-2 py-1 rounded border bg-white text-orange-600 border-orange-200 flex items-center gap-1">
                                  <Scale size={12} /> Pending
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No active pickup requests.
              </p>
            )}
          </div>

          {/* Recent History (NOW INCLUDES REJECTED + SCROLLABLE) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-blue-500" /> History
            </h2>
            {/* Added Scrollable Container */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {activity.history && activity.history.length > 0 ? (
                activity.history.map((log) => {
                  // Check if this item is a Rejected Request
                  const isRejected = log.status === "Rejected";

                  return (
                    <div
                      key={log.id}
                      className={`p-3 border rounded-lg flex justify-between items-center ${
                        isRejected
                          ? "bg-red-50 border-red-100"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isRejected ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}

                        <div>
                          <p className="font-bold text-sm text-gray-800">
                            {log.waste_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.date).toLocaleDateString()}
                          </p>
                          {/* Show Rejection Reason if available */}
                          {isRejected && log.rejection_reason && (
                            <p className="text-xs text-red-500 mt-1 italic">
                              "{log.rejection_reason}"
                            </p>
                          )}
                        </div>
                      </div>

                      {isRejected ? (
                        <span className="text-xs font-bold text-red-600 border border-red-200 bg-white px-2 py-1 rounded">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-green-600">
                          +{log.points} pts
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No history found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
