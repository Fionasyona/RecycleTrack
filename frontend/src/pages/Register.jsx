import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Leaf,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext"; // 1. Import AuthContext

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Get the login function

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    password2: "",
    role: "resident",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const toggleRole = (isDriver) => {
    setFormData((prev) => ({
      ...prev,
      role: isDriver ? "service_provider" : "resident",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "Required";
    if (!formData.last_name) newErrors.last_name = "Required";
    if (!formData.email) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.phone) newErrors.phone = "Required";
    if (!formData.location) newErrors.location = "Required";
    if (!formData.password) newErrors.password = "Required";
    else if (formData.password.length < 8) newErrors.password = "Min 8 chars";
    if (formData.password !== formData.password2)
      newErrors.password2 = "Passwords must match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const registrationData = {
      username: formData.email,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      full_name: `${formData.first_name} ${formData.last_name}`,
      phone: formData.phone,
      address: formData.location,
      location: formData.location,
      role: formData.role,
    };

    try {
      // 1. Register the user
      await api.post("/users/register/", registrationData);

      // 2. Auto-Login immediately
      toast.success("Account created! Logging you in...");
      const user = await login(formData.email, formData.password);

      // 3. Redirect to specific dashboard based on role
      if (user.role === "admin" || user.is_superuser) {
        navigate("/admin", { replace: true });
      } else if (user.role === "service_provider") {
        navigate("/driver/dashboard", { replace: true });
      } else {
        // Default resident dashboard
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorData = error.response?.data;
      if (typeof errorData === "object" && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const message = Array.isArray(errorData[firstKey])
          ? errorData[firstKey][0]
          : errorData[firstKey];
        toast.error(`${firstKey}: ${message}`);
      } else {
        toast.error("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for styling
  const getBackgroundGradient = () => {
    if (formData.role === "service_provider")
      return "from-blue-700 to-cyan-800";
    return "from-green-600 to-teal-700";
  };

  const getButtonColor = () => {
    if (formData.role === "service_provider")
      return "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30";
    return "bg-green-600 hover:bg-green-700 shadow-green-500/30";
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br transition-colors duration-500 p-4 ${getBackgroundGradient()}`}
    >
      <div className="absolute top-0 left-0 w-full h-full opacity-10 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex overflow-hidden relative z-10">
        {/* LEFT SIDE: Decorative Panel */}
        <div
          className={`hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br transition-colors duration-500 ${
            formData.role === "service_provider"
              ? "from-blue-50 to-cyan-100"
              : "from-green-50 to-teal-100"
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div
              className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${
                formData.role === "service_provider"
                  ? "bg-blue-300"
                  : "bg-green-300"
              }`}
            ></div>
            <div
              className={`absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${
                formData.role === "service_provider"
                  ? "bg-cyan-300"
                  : "bg-teal-300"
              }`}
            ></div>
          </div>

          <div className="relative z-10 p-10 flex flex-col justify-between h-full text-gray-800">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 hover:bg-white/80"
              >
                <ArrowLeft size={14} /> Back to Home
              </Link>
            </div>

            <div className="mb-8">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm border border-gray-100 ${
                  formData.role === "service_provider"
                    ? "text-blue-600"
                    : "text-green-600"
                }`}
              >
                <Leaf className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold mb-3 leading-tight text-gray-900">
                Start Your Green <br />
                <span
                  className={
                    formData.role === "service_provider"
                      ? "text-blue-600"
                      : "text-green-600"
                  }
                >
                  Journey Today.
                </span>
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {formData.role === "service_provider"
                  ? "Join our fleet. Earn money while keeping the city clean."
                  : "Join a community committed to a cleaner planet. Track, earn, and make an impact."}
              </p>
            </div>

            <div className="text-xs text-gray-500">© 2025 RecycleTrack.</div>
          </div>
        </div>

        {/* RIGHT SIDE: Register Form */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-10 bg-white">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Create Account
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Enter your details to get started.
              </p>
            </div>

            {/* ROLE TABS */}
            <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
              <button
                type="button"
                onClick={() => toggleRole(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  formData.role === "resident"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User size={14} /> Resident
              </button>
              <button
                type="button"
                onClick={() => toggleRole(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  formData.role === "service_provider"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Truck size={14} /> Driver
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              {/* HIDDEN INPUTS */}
              <input type="text" style={{ display: "none" }} />
              <input type="password" style={{ display: "none" }} />

              {/* Names Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                    First Name
                  </label>
                  <Input
                    name="first_name"
                    placeholder="Jane"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={errors.first_name}
                    icon={User}
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                      formData.role === "service_provider"
                        ? "focus:ring-blue-500"
                        : "focus:ring-green-500"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                    Last Name
                  </label>
                  <Input
                    name="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={errors.last_name}
                    icon={User}
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                      formData.role === "service_provider"
                        ? "focus:ring-blue-500"
                        : "focus:ring-green-500"
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={Mail}
                  autoComplete="new-email"
                  className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                    formData.role === "service_provider"
                      ? "focus:ring-blue-500"
                      : "focus:ring-green-500"
                  }`}
                />
              </div>

              {/* Phone & Location Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+254..."
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    icon={Phone}
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                      formData.role === "service_provider"
                        ? "focus:ring-blue-500"
                        : "focus:ring-green-500"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                    Location
                  </label>
                  <Input
                    name="location"
                    placeholder="City"
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                    icon={MapPin}
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                      formData.role === "service_provider"
                        ? "focus:ring-blue-500"
                        : "focus:ring-green-500"
                    }`}
                  />
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    icon={Lock}
                    autoComplete="new-password"
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                      formData.role === "service_provider"
                        ? "focus:ring-blue-500"
                        : "focus:ring-green-500"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                    Confirm
                  </label>
                  <Input
                    type="password"
                    name="password2"
                    placeholder="••••••••"
                    value={formData.password2}
                    onChange={handleChange}
                    error={errors.password2}
                    icon={Lock}
                    autoComplete="new-password"
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:border-transparent transition-all shadow-sm ${
                      formData.role === "service_provider"
                        ? "focus:ring-blue-500"
                        : "focus:ring-green-500"
                    }`}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className={`w-full py-3 text-white shadow-lg transition-all rounded-lg font-bold text-sm mt-4 ${getButtonColor()}`}
                loading={loading}
              >
                {loading
                  ? "Creating Account..."
                  : `Sign Up as ${
                      formData.role === "service_provider"
                        ? "Driver"
                        : "Resident"
                    }`}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="px-2 bg-white text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className={`inline-flex items-center justify-center w-full py-2.5 border-2 font-bold rounded-lg transition-all text-xs ${
                  formData.role === "service_provider"
                    ? "text-blue-600 border-blue-200 bg-blue-50"
                    : "text-green-600 border-green-200 bg-green-50"
                }`}
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
