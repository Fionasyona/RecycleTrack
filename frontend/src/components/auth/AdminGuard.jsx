import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading Admin Access...
      </div>
    );
  }

  // DEBUG LOGS (Check your Console!)
  console.log("--- ADMIN GUARD CHECK ---");
  console.log("User Object:", user);
  console.log("User Role:", user?.role);
  console.log("Is Admin?", user?.role === "admin");

  // 1. Check if logged in
  if (!user) {
    console.log("Guard: No user found. Redirecting to Login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Role
  // We check for 'admin' (lowercase) because that is what we set in the python shell
  if (user.role !== "admin" && !user.is_superuser) {
    console.log("Guard: User is NOT admin. Redirecting to Dashboard.");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Guard: Access Granted.");
  return children;
};

export default AdminGuard;
