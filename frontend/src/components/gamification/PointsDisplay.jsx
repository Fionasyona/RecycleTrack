// src/components/gamification/PointsDisplay.jsx
import { TrendingUp, Award } from "lucide-react";

const PointsDisplay = ({ points, rank, level, pointsToNextLevel }) => {
  const progress = pointsToNextLevel
    ? ((1000 - pointsToNextLevel) / 1000) * 100
    : 0;

  const rankColors = {
    Bronze: "from-amber-700 to-amber-900",
    Silver: "from-gray-400 to-gray-600",
    Gold: "from-yellow-400 to-yellow-600",
    Platinum: "from-cyan-400 to-cyan-600",
    Diamond: "from-purple-400 to-purple-600",
  };

  const rankIcons = {
    Bronze: "🥉",
    Silver: "🥈",
    Gold: "🥇",
    Platinum: "💎",
    Diamond: "👑",
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 shadow-lg border border-primary-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="text-primary-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Your Points</h2>
          </div>
          <p className="text-gray-600 text-sm">Keep recycling to earn more!</p>
        </div>
        <div
          className={`bg-gradient-to-br ${
            rankColors[rank] || rankColors.Bronze
          } text-white px-4 py-2 rounded-full font-bold text-sm shadow-md flex items-center gap-2`}
        >
          <span className="text-xl">{rankIcons[rank] || rankIcons.Bronze}</span>
          <span>{rank || "Bronze"}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl font-bold text-primary-600">
          {points?.toLocaleString() || 0}
        </span>
        <span className="text-xl text-gray-600">points</span>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={16} />
            <span className="text-sm font-semibold text-gray-700">
              Level {level || 1}
            </span>
          </div>
          <span className="text-xs text-gray-600">
            {pointsToNextLevel || 0} points to next level
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-primary-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">{level || 1}</p>
          <p className="text-xs text-gray-600">Level</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">
        
          </p>
          <p className="text-xs text-gray-600">Activities</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">
    
          </p>
          <p className="text-xs text-gray-600">Ranking</p>
        </div>
      </div>
    </div>
  );
};

export default PointsDisplay;
