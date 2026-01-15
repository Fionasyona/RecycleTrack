import { Users, MapPin, Activity, TrendingUp } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        {Icon && <Icon size={24} className={color.replace("bg-", "text-")} />}
      </div>
      <span className="text-green-500 text-sm font-medium flex items-center gap-1">
        <TrendingUp size={16} /> +12%
      </span>
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value="1,234"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Recycle Centers"
          value="45"
          icon={MapPin}
          color="bg-green-500"
        />
        <StatCard
          title="Total Activities"
          value="8,560"
          icon={Activity}
          color="bg-purple-500"
        />
        <StatCard
          title="Points Awarded"
          value="450k"
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Actions</h2>
        <div className="text-gray-500 text-center py-8">
          Chart or Recent Activity Table goes here...
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
