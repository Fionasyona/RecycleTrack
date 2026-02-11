import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, Leaf, ArrowLeft, User, Truck, Shield } from "lucide-react";
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

  // State for Role Toggles
  const [activeRole, setActiveRole] = useState("resident");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);

      let displayRole = "User";
      if (user.role === "admin" || user.is_superuser) displayRole = "Admin";
      else if (user.role === "service_provider") displayRole = "Driver";

      if (
        activeRole === "service_provider" &&
        user.role !== "service_provider"
      ) {
        toast("Note: You logged in as a Resident, not a Driver.", {
          icon: "ℹ️",
        });
      }

      toast.success(`Welcome back, ${displayRole}!`);

      if (user.role === "admin" || user.is_superuser) {
        navigate("/admin", { replace: true });
      } else if (user.role === "service_provider") {
        navigate("/driver/dashboard", { replace: true });
      } else {
        navigate(from === "/login" ? "/dashboard" : from, { replace: true });
      }
    } catch (error) {
      console.error("Login UI Error:", error);
      const serverError = error.response?.data;
      let message = "Invalid email or password.";

      if (serverError) {
        if (serverError.detail) message = serverError.detail;
        else if (serverError.non_field_errors)
          message = serverError.non_field_errors[0];
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getThemeColor = () => {
    if (activeRole === "admin")
      return "text-purple-600 bg-purple-50 border-purple-200";
    if (activeRole === "service_provider")
      return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getButtonColor = () => {
    if (activeRole === "admin")
      return "bg-purple-600 hover:bg-purple-700 shadow-purple-500/30";
    if (activeRole === "service_provider")
      return "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30";
    return "bg-green-600 hover:bg-green-700 shadow-green-500/30";
  };

  const getBackgroundGradient = () => {
    if (activeRole === "admin") return "from-purple-800 to-indigo-900";
    if (activeRole === "service_provider") return "from-blue-700 to-cyan-800";
    return "from-green-600 to-teal-700";
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br transition-colors duration-500 p-4 ${getBackgroundGradient()}`}
    >
      <div className="absolute top-0 left-0 w-full h-full opacity-10 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
      </div>

      {/* Reduced max-width to 4xl and removed fixed min-height for compactness */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden relative z-10">
        {/* LEFT SIDE: Decorative Panel */}
        <div
          className={`hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br transition-colors duration-500 ${
            activeRole === "admin"
              ? "from-purple-50 to-indigo-100"
              : activeRole === "service_provider"
                ? "from-blue-50 to-cyan-100"
                : "from-green-50 to-teal-100"
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div
              className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${
                activeRole === "admin"
                  ? "bg-purple-300"
                  : activeRole === "service_provider"
                    ? "bg-blue-300"
                    : "bg-green-300"
              }`}
            ></div>
            <div
              className={`absolute top-1/3 right-1/4 w-32 h-32 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${
                activeRole === "admin"
                  ? "bg-indigo-300"
                  : activeRole === "service_provider"
                    ? "bg-cyan-300"
                    : "bg-teal-300"
              }`}
            ></div>
            <div
              className={`absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 ${
                activeRole === "admin"
                  ? "bg-pink-300"
                  : activeRole === "service_provider"
                    ? "bg-sky-300"
                    : "bg-lime-300"
              }`}
            ></div>
          </div>

          <div className="relative z-10 p-8 flex flex-col justify-between h-full text-gray-800">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 hover:bg-white/80"
              >
                <ArrowLeft size={14} /> Back to Home
              </Link>
            </div>

            <div className="mb-4">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm border border-gray-100 ${
                  activeRole === "admin"
                    ? "text-purple-600"
                    : activeRole === "service_provider"
                      ? "text-blue-600"
                      : "text-green-600"
                }`}
              >
                <Leaf className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2 leading-tight text-gray-900">
                Turn Waste into <br />
                <span
                  className={
                    activeRole === "admin"
                      ? "text-purple-600"
                      : activeRole === "service_provider"
                        ? "text-blue-600"
                        : "text-green-600"
                  }
                >
                  Opportunity.
                </span>
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {activeRole === "service_provider"
                  ? "Join our fleet. Optimize routes, collect efficiently, and earn rewards for keeping our cities clean."
                  : activeRole === "admin"
                    ? "Manage the ecosystem. Oversee operations, analytics, and user management."
                    : "Join our community of eco-warriors. Track your impact, earn rewards, and build a cleaner future."}
              </p>
            </div>

            <div className="text-xs text-gray-500">© 2025 RecycleTrack.</div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-white">
          <div className="max-w-sm w-full">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Login
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Welcome back! Please enter your details.
              </p>
            </div>

            {/* ROLE TABS */}
            <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
              <button
                type="button"
                onClick={() => setActiveRole("resident")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  activeRole === "resident"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User size={14} /> Resident
              </button>
              <button
                type="button"
                onClick={() => setActiveRole("service_provider")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  activeRole === "service_provider"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Truck size={14} /> Driver
              </button>
              <button
                type="button"
                onClick={() => setActiveRole("admin")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  activeRole === "admin"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Shield size={14} /> Admin
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <input type="text" style={{ display: "none" }} />
              <input type="password" style={{ display: "none" }} />

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    placeholder={
                      activeRole === "admin"
                        ? "admin@recycletrack.com"
                        : "you@example.com"
                    }
                    value={formData.email}
                    onChange={handleChange}
                    icon={Mail}
                    required
                    autoComplete="new-email"
                    // Reduced padding from py-3.5 to py-2.5
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                      activeRole === "admin"
                        ? "focus:ring-purple-500"
                        : activeRole === "service_provider"
                          ? "focus:ring-blue-500"
                          : "focus:ring-green-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    icon={Lock}
                    required
                    autoComplete="new-password"
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                      activeRole === "admin"
                        ? "focus:ring-purple-500"
                        : activeRole === "service_provider"
                          ? "focus:ring-blue-500"
                          : "focus:ring-green-500"
                    }`}
                  />
                </div>
                <div className="flex justify-end mt-1.5">
                  <Link
                    to="/forgot-password"
                    className={`text-[10px] font-bold uppercase tracking-wide hover:underline ${
                      activeRole === "admin"
                        ? "text-purple-600 hover:text-purple-700"
                        : activeRole === "service_provider"
                          ? "text-blue-600 hover:text-blue-700"
                          : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className={`w-full py-3 text-white shadow-lg transition-all rounded-lg font-bold text-sm mt-2 ${getButtonColor()}`}
                loading={loading}
              >
                {loading
                  ? "Signing In..."
                  : `Login to ${
                      activeRole === "service_provider"
                        ? "Driver"
                        : activeRole === "admin"
                          ? "Admin"
                          : "Resident"
                    }`}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="px-2 bg-white text-gray-400">Or</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className={`inline-flex items-center justify-center w-full py-2.5 border-2 font-bold rounded-lg transition-all text-xs ${getThemeColor()}`}
              >
                Create New Account
              </Link>
            </div>

            <div className="mt-6 text-center">
              <div className="flex justify-center gap-4 text-[10px] text-gray-400 font-medium">
                <a href="#" className="hover:text-gray-600">
                  Terms
                </a>
                <a href="#" className="hover:text-gray-600">
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
