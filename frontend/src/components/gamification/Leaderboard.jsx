import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

const Leaderboard = ({ users }) => {
  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-amber-700" size={24} />;
      default:
        return <Award className="text-gray-400" size={20} />;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-700 to-amber-900 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl">
          <TrendingUp className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          <p className="text-sm text-gray-600">Top eco-warriors this month</p>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.user_id}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
              user.is_current_user
                ? "bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 shadow-md"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-12 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(
                  user.rank
                )}`}
              >
                #{user.rank}
              </div>
              <div className="mt-1">{getMedalIcon(user.rank)}</div>
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl">
                {user.avatar}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.full_name}
                  {user.is_current_user && (
                    <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">
                  🏆 {user.badge_count} badges
                </span>
              </div>
            </div>

            {/* Points */}
            <div className="flex-shrink-0 text-right">
              <div className="text-2xl font-bold text-primary-600">
                {user.points.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Keep recycling to climb the leaderboard! 🌱
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
