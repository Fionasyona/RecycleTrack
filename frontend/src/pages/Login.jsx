import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, Leaf, ArrowLeft } from "lucide-react";
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
      const message =
        error.response?.data?.detail || "Invalid email or password.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE: Vibrant Green Design (CSS Only - No broken images) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-600 to-teal-700 overflow-hidden">
        {/* Decorative Shapes for "Delightful" look */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400 rounded-full mix-blend-overlay blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10 hover:bg-white/20"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-inner border border-white/20">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Turn Waste into <br />
              <span className="text-green-200">Opportunity.</span>
            </h2>
            <p className="text-lg text-green-50/90 max-w-md leading-relaxed">
              Join our community of eco-warriors. Track your impact, earn
              rewards, and build a cleaner future with every login.
            </p>
          </div>

          <div className="text-sm text-green-100/60">
            © 2025 RecycleTrack. Making the planet greener.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="max-w-md w-full">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2 text-base">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    icon={Mail}
                    required
                    // FIX: Added 'pl-12' (padding-left: 3rem) to prevent overlap with icon
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
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
                    // FIX: Added 'pl-12' to prevent overlap
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    class="text-sm text-green-600 hover:text-green-700 font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/30 transition-all rounded-xl font-bold text-lg mt-4"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                New to RecycleTrack?
              </span>
            </div>
          </div>

          {/* Create Account Link */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full py-3.5 border-2 border-green-100 text-green-700 font-bold rounded-xl hover:bg-green-50 hover:border-green-200 transition-all"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
