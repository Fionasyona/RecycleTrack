import React, { useState } from "react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { User, CheckCircle, Search, Trophy, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(null);

  const handleAwardPoints = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter a user email");

    setLoading(true);
    setLastSuccess(null);

    try {
      // Calls the endpoint: /users/award-points/
      const res = await api.post("/users/award-points/", { email });

      toast.success("Points awarded successfully!");
      setLastSuccess(res.data);
      setEmail("");
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.error ||
        "Could not find that user or server error.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header - Now Green */}
      <div className="bg-green-800 text-white p-8 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-400" /> Admin Console
          </h1>
          <p className="text-green-100 mt-2 opacity-90">
            Manage recycling verifications and system stats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. AWARD POINTS FORM */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Verify Drop-off
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleAwardPoints} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resident Email Address
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="resident@gmail.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Enter the exact email the user registered with.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white text-lg shadow-md transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                }`}
              >
                {loading ? "Processing..." : "Confirm Recycle (+20 pts)"}
              </button>
            </form>
          </div>
        </div>

        {/* 2. SUCCESS DISPLAY & INFO */}
        <div className="space-y-6">
          {lastSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center text-center animate-fade-in">
              <div className="bg-white p-4 rounded-full shadow-sm text-yellow-500 mb-4">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-green-900">
                Verification Successful!
              </h3>
              <p className="text-green-800 mt-1">
                Points have been added to the user's account.
              </p>

              <div className="mt-4 w-full bg-white p-4 rounded-lg shadow-sm border border-green-100 text-left">
                <p className="text-sm text-gray-500">New Balance</p>
                <p className="text-2xl font-bold text-gray-800">
                  {lastSuccess.new_total} pts
                </p>
                <div className="h-px bg-gray-100 my-2"></div>
                <p className="text-sm text-gray-500">Current Badge</p>
                <p className="text-lg font-bold text-green-600">
                  {lastSuccess.new_badge}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-700">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-green-800">
                <ShieldCheck className="w-4 h-4" /> Instructions
              </h3>
              <ul className="text-sm space-y-2 list-disc list-inside opacity-80">
                <li>Ask the resident for their registered email.</li>
                <li>
                  Ensure they have physically dropped off the recyclables.
                </li>
                <li>
                  Click verify to instantly credit <strong>20 points</strong> to
                  their account.
                </li>
                <li>The leaderboard updates automatically.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
