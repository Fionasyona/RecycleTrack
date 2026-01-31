import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Helper: check where the user came from
  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Login and GET the user data immediately
      const user = await login(formData.email, formData.password);

      // --- POPUP LOGIC ---
      let displayRole = "User";
      if (user.role === "admin" || user.is_superuser) displayRole = "Admin";
      else if (user.role === "service_provider") displayRole = "Driver";

      toast.success(`Welcome, ${displayRole}!`);

      // 2. FIXED REDIRECTS
      if (user.role === "admin" || user.is_superuser) {
        // Admin -> Admin Index
        navigate("/admin", { replace: true });
      } else if (user.role === "service_provider") {
        // FIX: Driver -> "/driver/dashboard" (Matches your App.js)
        navigate("/driver/dashboard", { replace: true });
      } else {
        // Resident -> User Dashboard
        navigate(from === "/login" ? "/dashboard" : from, { replace: true });
      }
    } catch (error) {
      console.error("Login UI Error:", error);
      const message =
        error.response?.data?.detail || "Invalid email or password.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl shadow-lg mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Login to RecycleTrack</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              loading={loading}
            >
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-green-600 hover:underline font-medium"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
