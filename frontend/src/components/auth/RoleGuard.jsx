import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Check this path matches your folder structure!

const RoleGuard = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  // 1. If not logged in, kick to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If user has one of the allowed roles, let them in
  if (allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  // 3. UNAUTHORIZED: Redirect to the CORRECT dashboard based on their actual role
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "service_provider") {
    return <Navigate to="/driver/dashboard" replace />;
  }

  // Default fallback (Residents)
  return <Navigate to="/dashboard" replace />;
};

export default RoleGuard;
