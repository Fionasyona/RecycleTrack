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
} from "lucide-react";

const CollectorDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("active");
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const NAIROBI_CENTER = [-1.2921, 36.8219];

  // Helper: Get Coordinates (Used for Navigation Button)
  const getJobCoordinates = (job) => {
    const lat = parseFloat(job.latitude);
    const lng = parseFloat(job.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    return NAIROBI_CENTER;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobRes = await api.get("/users/collector/jobs/");
      setJobs(Array.isArray(jobRes) ? jobRes : jobRes.data || []);

      const histRes = await api.get("/users/collector/history/");
      setHistory(Array.isArray(histRes) ? histRes : histRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const openGoogleMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank",
    );
  };

  // Grouping Logic
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto space-y-6 mb-6">
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

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-700 text-white p-4 rounded-xl shadow-lg shadow-green-200 text-center">
            <p className="text-xs uppercase font-bold opacity-80">
              Active Tasks
            </p>
            <p className="text-3xl font-bold">{jobs.length}</p>
          </div>
          <div className="bg-white text-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs uppercase font-bold text-gray-400">
              Completed
            </p>
            <p className="text-3xl font-bold">{history.length}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-between items-end border-b border-gray-200 pb-1">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 pb-2 px-2 font-bold text-sm ${activeTab === "active" ? "text-green-600 border-b-2 border-green-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Clock size={16} /> Active Tasks
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 pb-2 px-2 font-bold text-sm ${activeTab === "history" ? "text-green-600 border-b-2 border-green-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Archive size={16} /> History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
            Loading data...
          </div>
        ) : (
          <>
            {/* ACTIVE JOBS */}
            {activeTab === "active" && (
              <>
                {jobs.length === 0 ? (
                  <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                    <CheckCircle className="w-12 h-12 text-green-100 mx-auto mb-2" />
                    No active jobs assigned.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupJobsByAssignmentDate(jobs)).map(
                      ([date, dateJobs]) => (
                        <div key={date}>
                          {/* --- HEADER: ASSIGNED DATE --- */}
                          <div className="flex items-center gap-2 mb-3 ml-1">
                            <CalendarClock
                              size={16}
                              className="text-orange-500"
                            />
                            <h3 className="text-sm font-bold text-gray-500 uppercase">
                              Assigned On: {date}
                            </h3>
                          </div>

                          <div className="space-y-4">
                            {dateJobs.map((job) => {
                              const coords = getJobCoordinates(job);
                              return (
                                <div
                                  key={job.id}
                                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                                >
                                  <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-blue-50 text-blue-600 border border-blue-100">
                                      {job.status}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">
                                      #{job.id}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-gray-800">
                                        <User
                                          size={16}
                                          className="text-gray-400"
                                        />
                                        <span className="font-bold text-sm">
                                          {job.user_full_name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Package
                                          size={16}
                                          className="text-gray-400"
                                        />
                                        <span>
                                          {job.waste_type} - {job.quantity}
                                        </span>
                                      </div>

                                      {/* --- SCHEDULED PICKUP DATE --- */}
                                      <div className="flex items-center gap-2 text-orange-600 text-sm font-medium bg-orange-50 p-2 rounded-lg w-fit mt-1">
                                        <Calendar size={14} />
                                        <span>
                                          Pickup Date:{" "}
                                          {new Date(
                                            job.scheduled_date,
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-start gap-2 text-gray-600 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <MapPin
                                          size={14}
                                          className="text-green-600 mt-0.5 shrink-0"
                                        />
                                        <span>
                                          {job.pickup_address ||
                                            "No address provided"}
                                          , {job.region}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 border-t border-gray-50 pt-4">
                                    <button
                                      onClick={() =>
                                        openGoogleMaps(coords[0], coords[1])
                                      }
                                      className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 py-2.5 rounded-lg hover:bg-blue-100 transition"
                                    >
                                      <Navigation size={14} /> Navigate
                                    </button>
                                    {job.status === "assigned" && (
                                      <button
                                        onClick={() => handleConfirm(job.id)}
                                        className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition text-xs"
                                      >
                                        <CheckCircle size={14} /> Complete Job
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </>
            )}

            {/* HISTORY */}
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
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center opacity-75"
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
                          {job.user_full_name} - {job.waste_type}
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
