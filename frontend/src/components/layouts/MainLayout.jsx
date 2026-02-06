import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom"; // Added Outlet
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  MapPin,
  BookOpen,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  User,
  Bell,
} from "lucide-react";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const SidebarLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setIsSidebarOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium mb-1 ${
        isActive(to)
          ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
          : "text-gray-400 hover:bg-gray-700 hover:text-white"
      }`}
    >
      <Icon
        size={20}
        className={isActive(to) ? "fill-green-600 text-white" : ""}
      />
      {label}
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- SIDEBAR --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full text-white">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-gray-700">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <div className="p-1.5 bg-green-600 rounded-lg">
                <Leaf className="text-white" size={20} />
              </div>
              <span>
                Recycle<span className="text-green-400">Track</span>
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden ml-auto text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-700 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-green-400 font-bold border border-gray-600">
                {user?.full_name?.[0] || <User size={18} />}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-200 text-sm truncate">
                  {user?.full_name || "Resident"}
                </p>
                <p className="text-xs text-gray-400 font-medium truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-2 tracking-wider">
              Main Menu
            </div>
            <SidebarLink
              to="/dashboard"
              label="Dashboard"
              icon={LayoutDashboard}
            />
            <SidebarLink to="/book-pickup" label="Book Pickup" icon={Truck} />
            <SidebarLink to="/maps" label="Recycling Map" icon={MapPin} />
            <SidebarLink to="/education" label="Education" icon={BookOpen} />

            <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-2 mt-6 tracking-wider">
              Settings
            </div>
            <SidebarLink to="/profile" label="My Profile" icon={Settings} />
          </nav>

          <div className="p-4 border-t border-gray-700 space-y-2 bg-gray-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-bold"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 capitalize">
              {location.pathname.replace("/", "").replace("-", " ") ||
                "RecycleTrack"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* The Dashboard/Page content will render here */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
