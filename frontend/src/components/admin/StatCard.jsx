// src/components/admin/StatCard.jsx
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon, // <--- FIX: Accept 'icon' prop and rename it to 'Icon'
  trend,
  trendValue,
  color = "primary",
}) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
        </div>

        {/* Only render the icon div if Icon is actually provided */}
        {Icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}
          >
            <Icon className="text-white" size={24} />
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-sm">
          {trend === "up" ? (
            <>
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-green-600 font-semibold">
                +{trendValue}%
              </span>
            </>
          ) : (
            <>
              <TrendingDown size={16} className="text-red-600" />
              <span className="text-red-600 font-semibold">-{trendValue}%</span>
            </>
          )}
          <span className="text-gray-600 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
