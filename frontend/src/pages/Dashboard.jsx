import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { centerAPI, api } from "../services/api";
import toast from "react-hot-toast";
import {
  MapPin,
  Trophy,
  ArrowRight,
  Crown,
  Medal,
  User,
  Truck,
  Clock,
  CheckCircle,
  History,
  Calendar,
  CalendarClock,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(
    currentUser || { points: 0, badge: "Newcomer", full_name: "Resident" },
  );
  const [centerCount, setCenterCount] = useState(0);
  const [leaders, setLeaders] = useState([]);
  const [activity, setActivity] = useState({ pending: [], history: [] });
  const [loading, setLoading] = useState(true);

  // --- PAYMENT HANDLER ---
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

      const historyRes = await api.get("/users/history/");
      const historyData = historyRes.pending ? historyRes : historyRes.data;
      setActivity(historyData || { pending: [], history: [] });
    } catch (error) {
      console.error(error);
      toast.error("Payment failed. Please try again.", { id: toastId });
    }
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

  // Helper: Get Display Name
  const getDisplayName = (userObj) => {
    if (userObj.full_name && userObj.full_name.trim() !== "")
      return userObj.full_name;
    if (userObj.first_name)
      return `${userObj.first_name} ${userObj.last_name || ""}`;
    // Fallback: Use part of email before @
    if (userObj.email) return userObj.email.split("@")[0];
    return "Resident";
  };

  const groupPendingByBookingDate = (items) => {
    const groups = {};
    const sorted = [...items].sort((a, b) => {
      const dateA = new Date(a.created_at || Date.now());
      const dateB = new Date(b.created_at || Date.now());
      return dateB - dateA;
    });

    sorted.forEach((item) => {
      const dateObj = new Date(item.created_at || Date.now());
      const dateStr = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
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

        const leadersData = leaderboardRes.data || leaderboardRes;
        setLeaders(Array.isArray(leadersData) ? leadersData : []);

        const historyData = historyRes.pending ? historyRes : historyRes.data;
        if (historyData && historyData.pending) {
          setActivity(historyData);
        } else {
          setActivity({ pending: [], history: [] });
        }
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
      <div className="p-10 text-center text-gray-500">
        Loading your dashboard...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
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
              You have earned <strong>{profile.points} points</strong>.
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
                className="bg-yellow-400 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
            <p className="text-xs text-green-200 mt-2 text-center">
              {progress.target - profile.points > 0
                ? `${Math.ceil((progress.target - profile.points) / 20)} more recycles to level up!`
                : "You are at the top level!"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. STATS & ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer group"
        >
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium group-hover:text-blue-600 transition-colors">
              Active Centers
            </p>
            <p className="text-2xl font-bold text-gray-900">{centerCount}</p>
          </div>
        </Link>

        <Link
          to="/book-pickup"
          className="bg-green-600 p-6 rounded-xl shadow-md flex items-center justify-between gap-4 text-white hover:bg-green-700 hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full text-white">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-100">
                Ready to Recycle?
              </p>
              <p className="text-xl font-bold">Book Pickup</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3. MY ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Requests */}
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
                          className={`p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${req.status === "cancelled" ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"}`}
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
                            {req.status === "cancelled" && (
                              <p className="text-xs text-red-600 font-bold mt-1">
                                ⚠️ {req.rejection_reason || "Request declined"}
                              </p>
                            )}
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
                                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm animate-pulse"
                                >
                                  <CreditCard size={12} /> Pay KES 100
                                </button>
                              )
                            )}
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded border capitalize ${req.status === "cancelled" ? "bg-white text-red-600 border-red-200" : req.status === "assigned" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-orange-600 border-orange-200"}`}
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
              {activity.history.slice(0, 3).map((log) => (
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

      {/* 4. LEADERBOARD SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Community Leaderboard
          </h2>
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
            Top 20 Heroes
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {Array.isArray(leaders) && leaders.length > 0 ? (
            leaders.map((player, index) => (
              <div
                key={player.id || index}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${currentUser?.email === player.email ? "bg-yellow-50 border-l-4 border-yellow-400" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-400" : "bg-green-600"}`}
                    >
                      {getDisplayName(player)[0].toUpperCase()}
                    </div>
                    <div>
                      {/* --- FIX: USE DISPLAY NAME FUNCTION --- */}
                      <p
                        className={`text-sm font-bold ${currentUser?.email === player.email ? "text-green-800" : "text-gray-800"}`}
                      >
                        {getDisplayName(player)}
                        {currentUser?.email === player.email && " (You)"}
                      </p>
                      {/* -------------------------------------- */}
                      <p className="text-xs text-gray-400">{player.badge}</p>
                    </div>
                  </div>
                </div>
                <div className="font-bold text-gray-700">
                  {player.points}{" "}
                  <span className="text-xs font-normal text-gray-400">pts</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No leaderboard data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
