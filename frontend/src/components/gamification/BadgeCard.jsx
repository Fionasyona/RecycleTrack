import { Lock, CheckCircle } from "lucide-react";

const BadgeCard = ({ badge }) => {
  // 1. SAFETY CHECK: If badge is null, don't render
  if (!badge) return null;

  // 2. DATA NORMALIZATION (Fixing the crash)
  // The backend sends 'badge_type', but this UI expects 'tier'.
  // We also handle 'earned' vs 'unlocked'.
  const tier = (badge.badge_type || badge.tier || "bronze").toLowerCase();
  const unlocked = badge.earned || badge.unlocked || false;
  const unlocked_at = badge.earned_date || badge.unlocked_at;
  const total = badge.total || 100; // Assume 100 if no total is sent
  const progress = badge.progress || 0;

  const { name, description, icon } = badge;

  const tierColors = {
    bronze: "from-amber-700 to-amber-900",
    silver: "from-gray-400 to-gray-600",
    gold: "from-yellow-400 to-yellow-600",
    platinum: "from-cyan-400 to-cyan-600",
    diamond: "from-purple-400 to-purple-600",
    // Fallback for "common" or others
    common: "from-blue-400 to-blue-600",
  };

  // Safe color lookup (fallback to bronze if tier type doesn't match keys)
  const activeColor = tierColors[tier] || tierColors.bronze;

  const progressPercent = total ? (progress / total) * 100 : 0;

  return (
    <div
      className={`relative rounded-xl p-5 transition-all duration-300 hover:scale-105 ${
        unlocked
          ? "bg-gradient-to-br from-white to-gray-50 shadow-lg border-2 border-primary-200"
          : "bg-gray-100 opacity-70"
      }`}
    >
      {/* Badge Icon */}
      <div className="flex items-center justify-center mb-4">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
            unlocked
              ? `bg-gradient-to-br ${activeColor} shadow-xl`
              : "bg-gray-300"
          }`}
        >
          {unlocked ? icon : <Lock className="text-white" size={32} />}
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center mb-3">
        <h3
          className={`font-bold text-lg mb-1 ${
            unlocked ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {name}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
      </div>

      {/* Progress Bar */}
      {!unlocked && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Progress</span>
            <span className="text-xs font-semibold text-gray-700">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className={`bg-gradient-to-r ${activeColor} h-full rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlocked Badge */}
      {unlocked && unlocked_at && (
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <CheckCircle className="text-green-500" size={16} />
          <span className="text-xs text-gray-600">
            Unlocked {new Date(unlocked_at).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Tier Badge */}
      <div className="absolute top-3 right-3">
        <span
          className={`text-xs px-2 py-1 rounded-full font-bold text-white ${
            unlocked ? `bg-gradient-to-r ${activeColor}` : "bg-gray-400"
          }`}
        >
          {tier.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default BadgeCard;
