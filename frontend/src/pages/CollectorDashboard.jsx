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
} from "lucide-react";

const CollectorDashboard = () => {
  const { user, logout } = useAuth();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("active");
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH ALL DATA
  const fetchData = async () => {
    setLoading(true);

    // Fetch 1: Active Jobs
    try {
      const res = await api.get("/users/collector/jobs/");
      const data = Array.isArray(res) ? res : res.data || [];
      setJobs(data);
    } catch (error) {
      console.error("Failed to load active jobs:", error);
    }

    // Fetch 2: History
    try {
      const res = await api.get("/users/collector/history/");
      const data = Array.isArray(res) ? res : res.data || [];
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. ACTIONS
  const handleConfirm = async (id) => {
    if (!window.confirm("Confirm you have collected these items?")) return;
    try {
      await api.patch(`/users/collector/confirm/${id}/`);
      toast.success("Pickup Confirmed! Waiting for Admin verification.");
      fetchData();
    } catch (error) {
      toast.error("Failed to confirm pickup");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER & STATS (Green Theme) */}
      <div className="max-w-3xl mx-auto space-y-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <Truck className="text-green-600" /> Driver Portal
            </h1>
            <p className="text-sm text-gray-500">
              Welcome, {user?.full_name || "Driver"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-600 font-bold border border-red-100 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* STATS PILLS (Green Theme) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-700 text-white p-4 rounded-xl shadow-lg shadow-green-200 text-center">
            <p className="text-xs uppercase font-bold opacity-80">
              Active Tasks
            </p>
            <p className="text-3xl font-bold">{jobs.length}</p>
          </div>
          <div className="bg-white text-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs uppercase font-bold text-gray-400">
              Total Completed
            </p>
            <p className="text-3xl font-bold">{history.length}</p>
          </div>
        </div>

        {/* TABS (Green Selection) */}
        <div className="flex gap-4 border-b border-gray-200 pb-1">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 pb-3 px-2 transition-colors font-bold text-sm ${activeTab === "active" ? "text-green-600 border-b-2 border-green-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Clock size={16} /> Active Tasks
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 pb-3 px-2 transition-colors font-bold text-sm ${activeTab === "history" ? "text-green-600 border-b-2 border-green-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Archive size={16} /> Job History
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Loader className="w-8 h-8 animate-spin text-green-600 mb-2" />
            Loading data...
          </div>
        ) : (
          <>
            {/* === ACTIVE JOBS TAB === */}
            {activeTab === "active" && (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No active jobs.
                    <p className="text-xs mt-2">
                      New assignments will appear here.
                    </p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job.id}
                      className={`bg-white p-5 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md ${job.status === "collected" ? "border-gray-400 opacity-70 bg-gray-50" : "border-green-600"}`}
                    >
                      <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${job.status === "collected" ? "bg-gray-200 text-gray-700" : "bg-green-100 text-green-700"}`}
                        >
                          {job.status}
                        </span>
                        <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
                          {new Date(job.scheduled_date).toDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User size={16} className="text-gray-400" />
                            <span className="font-bold">
                              {job.user_full_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Package size={16} className="text-gray-400" />
                            <span>
                              {job.waste_type} - {job.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                          <MapPin size={16} className="text-green-600 mt-0.5" />
                          <span>{job.center_name}</span>
                        </div>
                      </div>
                      {job.status === "assigned" ? (
                        <button
                          onClick={() => handleConfirm(job.id)}
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                          <CheckCircle size={18} /> Confirm Collection
                        </button>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-center border border-gray-200 text-sm flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> Collected - Pending
                          Verification
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* === HISTORY TAB === */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center p-12 text-gray-400 italic">
                    No completed jobs yet.
                  </div>
                ) : (
                  history.map((job) => (
                    <div
                      key={job.id}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                            <CheckCircle size={10} /> Verified
                          </span>
                          <span className="text-xs font-bold text-gray-500">
                            {new Date(job.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-bold text-gray-700 text-sm">
                          {job.user_full_name} - {job.waste_type} (
                          {job.quantity})
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={10} /> {job.center_name}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CollectorDashboard;
