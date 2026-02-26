import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  MapPin,
  BookOpen,
  LogOut,
  ShieldCheck,
  Truck,
  Menu,
  X,
  BarChart2, // <-- ADDED ICON HERE
} from "lucide-react";

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile Sidebar State

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/reports", label: "Reports", icon: <BarChart2 size={20} /> }, // <-- ADDED REPORTS TAB HERE
    { path: "/admin/users", label: "Manage Users", icon: <Users size={20} /> },
    {
      path: "/admin/collectors",
      label: "Manage Collectors",
      icon: <Truck size={20} />,
    },
    {
      path: "/admin/centers",
      label: "Recycling Centers",
      icon: <MapPin size={20} />,
    },
    {
      path: "/admin/education",
      label: "Education Content",
      icon: <BookOpen size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* === MOBILE OVERLAY === */}
      {/* Dark background when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* === SIDEBAR (Dark Navy Blue & Fixed Height) === */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 
        `}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-500 w-8 h-8" />
            <span className="text-xl font-bold text-white">Admin Portal</span>
          </div>
          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Close on click (mobile)
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow-md">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white text-sm truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Administrator
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-400 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors text-sm font-bold shadow-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      {/* Added md:ml-64 to push content right on desktop since sidebar is fixed */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Mobile Header (Hamburger Menu) - Only visible on Mobile */}
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-green-600 w-6 h-6" /> Admin Portal
          </span>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
