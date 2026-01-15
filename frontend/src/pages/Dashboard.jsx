import { useState, useEffect } from "react";
import { Plus, Activity, Clock, TrendingUp } from "lucide-react";
import { Button } from "../components/common/Button";
import PointsDisplay from "../components/gamification/PointsDisplay";
import BadgeCard from "../components/gamification/BadgeCard";
import Leaderboard from "../components/gamification/Leaderboard";
import ReportActivityModal from "../components/gamification/ReportActivityModal";
import gamificationService from "../services/gamificationService";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [userPoints, setUserPoints] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [pointsData, badgesData, leaderboardData, activitiesData] =
        await Promise.all([
          gamificationService.getUserPoints(),
          gamificationService.getUserBadges(),
          gamificationService.getLeaderboard(5),
          gamificationService.getRecentActivities(5),
        ]);

      setUserPoints(pointsData);
      setBadges(badgesData);
      setLeaderboard(leaderboardData);
      setRecentActivities(activitiesData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityReported = (newActivity) => {
    // Refresh dashboard data after reporting
    loadDashboardData();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    const icons = {
      plastic_recycling: "♻️",
      e_waste: "📱",
      organic_composting: "🌱",
      paper_recycling: "📄",
    };
    return icons[type] || "♻️";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, Recycler! 🌍
          </h1>
          <p className="text-gray-600 text-lg">
            Track your impact and earn rewards for making the planet greener
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="mb-8">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="w-full sm:w-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus size={20} />
            Report New Activity
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Points Display - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <PointsDisplay
              points={userPoints?.total_points}
              rank={userPoints?.rank}
              level={userPoints?.level}
              pointsToNextLevel={userPoints?.points_to_next_level}
            />
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
                <p className="text-sm text-gray-600">Your impact this month</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">CO₂ Saved</span>
                <span className="text-lg font-bold text-green-600">
                  {Math.floor((userPoints?.total_points || 0) * 0.5)} kg
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Trees Planted</span>
                <span className="text-lg font-bold text-blue-600">
                  {Math.floor((userPoints?.total_points || 0) / 100)} 🌳
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700">Streak Days</span>
                <span className="text-lg font-bold text-purple-600">12 🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Badges</h2>
              <p className="text-gray-600">
                Unlock achievements as you recycle more
              </p>
            </div>
            <span className="text-sm text-gray-600">
              {badges.filter((b) => b.unlocked).length}/{badges.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>

        {/* Bottom Grid - Leaderboard & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard - 2 columns */}
          <div className="lg:col-span-2">
            <Leaderboard users={leaderboard} />
          </div>

          {/* Recent Activity - 1 column */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-600">Your latest actions</p>
              </div>
            </div>

            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-2xl">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        +{activity.points_earned}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No activities yet</p>
                  <p className="text-xs mt-1">
                    Start recycling to see your progress!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Activity Modal */}
      <ReportActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActivityReported={handleActivityReported}
      />
    </div>
  );
};

export default Dashboard;
