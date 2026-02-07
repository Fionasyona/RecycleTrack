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
  Check,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import toast from "react-hot-toast";
import { api } from "../services/api";

const Register = () => {
  const navigate = useNavigate();

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
      await api.post("/users/register/", registrationData);
      toast.success(`Account created! Please login.`);
      navigate("/login");
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-8">
      {/* Main Card Container */}
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        {/* LEFT SIDE: Vibrant Visuals (CSS Only) */}
        <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-green-600 to-teal-800 relative p-12 flex-col justify-between overflow-hidden">
          {/* Decorative Shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-400 rounded-full mix-blend-overlay blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium mb-8"
            >
              <ArrowLeft size={16} /> Back to website
            </Link>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Start Your Green <br /> Journey Today.
            </h2>
            <p className="text-green-100 text-lg opacity-90">
              Join a community committed to a cleaner planet. Track, earn, and
              make an impact.
            </p>
          </div>

          {/* Feature List on Left */}
          <div className="relative z-10 space-y-4">
            {[
              "Earn points for every kilo recycled",
              "Track your environmental impact",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: The Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 bg-white overflow-y-auto">
          <div className="max-w-lg mx-auto">
            <div className="text-center lg:text-left mb-8">
              <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Account
              </h1>
              <p className="text-gray-500 mt-2">
                Enter your details to get started.
              </p>
            </div>

            {/* Role Selection - Modern Segmented Control */}
            <div className="bg-gray-100 p-1.5 rounded-xl flex mb-8">
              <button
                type="button"
                onClick={() => toggleRole(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  formData.role === "resident"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User size={16} /> Resident
              </button>
              <button
                type="button"
                onClick={() => toggleRole(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  formData.role === "service_provider"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Truck size={16} /> Driver
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <Input
                      name="first_name"
                      placeholder="Jane"
                      value={formData.first_name}
                      onChange={handleChange}
                      error={errors.first_name}
                      icon={User}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <Input
                      name="last_name"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                      error={errors.last_name}
                      icon={User}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={Mail}
                    className="w-full bg-white border border-gray-300 rounded-xl pl-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+254 700 000"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      icon={Phone}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <Input
                      name="location"
                      placeholder="Nairobi"
                      value={formData.location}
                      onChange={handleChange}
                      error={errors.location}
                      icon={MapPin}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      icon={Lock}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Confirm
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      name="password2"
                      placeholder="••••••••"
                      value={formData.password2}
                      onChange={handleChange}
                      error={errors.password2}
                      icon={Lock}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className={`w-full py-4 text-lg font-bold shadow-lg hover:translate-y-[-2px] transition-all rounded-xl ${
                    formData.role === "service_provider"
                      ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/30"
                      : "bg-green-600 hover:bg-green-500 shadow-green-500/30"
                  }`}
                  loading={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-green-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
