import {
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  CreditCard,
  History,
  MapPin,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, centerAPI } from "../services/api";

const Dashboard = () => {
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(
    currentUser || { points: 0, badge: "Newcomer", full_name: "Resident" },
  );
  const [centerCount, setCenterCount] = useState(0);
  const [activity, setActivity] = useState({ pending: [], history: [] });
  const [loading, setLoading] = useState(true);

  // --- HELPER FUNCTIONS ---
  const getDisplayName = (userObj) => {
    if (userObj.full_name && userObj.full_name.trim() !== "")
      return userObj.full_name;
    if (userObj.first_name)
      return `${userObj.first_name} ${userObj.last_name || ""}`;
    if (userObj.email) return userObj.email.split("@")[0];
    return "Resident";
  };

  const getBadgeProgress = (points) => {
    if (points >= 2000)
      return { next: "Max Level", target: 2000, percent: 100 };
    if (points >= 1000)
      return {
        next: "Recycle Legend",
        target: 2000,
        percent: (points / 2000) * 100,
      };
    if (points >= 500)
      return {
        next: "Planet Protector",
        target: 1000,
        percent: (points / 1000) * 100,
      };
    if (points >= 250)
      return {
        next: "Waste Warrior",
        target: 500,
        percent: (points / 500) * 100,
      };
    if (points >= 100)
      return {
        next: "Green Guardian",
        target: 250,
        percent: (points / 250) * 100,
      };
    return { next: "Eco Starter", target: 100, percent: (points / 100) * 100 };
  };

  const progress = getBadgeProgress(profile.points || 0);

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

  const handlePayment = async (pickupId) => {
    if (!window.confirm("Pay KES 100 for waste collection service?")) return;
    const toastId = toast.loading("Processing M-Pesa payment...");
    try {
      await api.post("/users/payment/initiate/", {
        pickup_id: pickupId,
        amount: 100,
        phone: profile.phone || currentUser.phone,
      });
      toast.success("Payment Received!", { id: toastId });
      fetchHistory();
    } catch (error) {
      toast.error("Payment failed. Please try again.", { id: toastId });
    }
  };

  const fetchHistory = async () => {
    try {
      const historyRes = await api.get("/users/history/");
      const historyData = historyRes.pending ? historyRes : historyRes.data;
      setActivity(
        historyData && historyData.pending
          ? historyData
          : { pending: [], history: [] },
      );
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centersRes, profileRes, historyRes] = await Promise.all([
          centerAPI.getAll(),
          api.get("/users/profile/"),
          api.get("/users/history/"),
        ]);

        const centers = Array.isArray(centersRes)
          ? centersRes
          : centersRes.results || [];
        setCenterCount(centers.length);
        setProfile(profileRes.data || profileRes);

        const historyData = historyRes.pending ? historyRes : historyRes.data;
        setActivity(
          historyData && historyData.pending
            ? historyData
            : { pending: [], history: [] },
        );
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
    // REMOVED <MainLayout> WRAPPER
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. HERO SECTION */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
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
              You have earned <strong>{profile.points} points</strong> recycling
              with us.
            </p>
          </div>

          <div className="w-full md:w-1/3 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>Next: {progress.next}</span>
              <span>
                {profile.points} / {progress.target} pts
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
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Points</p>
            <p className="text-2xl font-bold text-gray-900">{profile.points}</p>
          </div>
        </div>

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

      {/* 3. LISTS (Requests & History) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pickup Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" /> Pickup Requests
          </h2>
          {activity.pending && activity.pending.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupPendingByBookingDate(activity.pending)).map(
                ([dateLabel, groupReqs]) => (
                  <div key={dateLabel}>
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarClock size={14} className="text-orange-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        Booked on: {dateLabel}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupReqs.map((req) => (
                        <div
                          key={req.id}
                          className={`p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                            req.status === "cancelled"
                              ? "bg-red-50 border-red-100"
                              : "bg-orange-50 border-orange-100"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-sm text-gray-800">
                              {req.waste_type} ({req.quantity})
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                              <Calendar size={12} className="text-green-600" />
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
                            {req.payment_status === "Paid" ? (
                              <span className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                                <CheckCircle size={12} /> PAID
                              </span>
                            ) : (
                              req.status === "pending" && (
                                <button
                                  onClick={() => handlePayment(req.id)}
                                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 animate-pulse transition"
                                >
                                  <CreditCard size={12} /> Pay KES 100
                                </button>
                              )
                            )}
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded border capitalize ${
                                req.status === "cancelled"
                                  ? "bg-white text-red-600 border-red-200"
                                  : "bg-white text-orange-600 border-orange-200"
                              }`}
                            >
                              {req.status === "cancelled"
                                ? "Rejected"
                                : req.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No recent requests.</p>
          )}
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-blue-500" /> Recent History
          </h2>
          {activity.history && activity.history.length > 0 ? (
            <div className="space-y-3">
              {activity.history.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {log.waste_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    +{log.points} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No recycling history yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
