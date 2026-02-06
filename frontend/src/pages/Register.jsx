import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, MapPin, Leaf, Truck } from "lucide-react";
// 1. Remove 'register' from useAuth since it's causing the crash
// import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import toast from "react-hot-toast";
// 2. Import your API service directly
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
    role: "resident", // Default role
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Toggle between Resident and Driver
  const toggleRole = (isDriver) => {
    setFormData((prev) => ({
      ...prev,
      role: isDriver ? "service_provider" : "resident",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.password2) {
      newErrors.password2 = "Please confirm your password";
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match";
    }
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
      role: formData.role, // Critical: Send the selected role
    };

    try {
      // 3. FIX: Use api.post directly instead of the missing context function
      await api.post("/users/register/", registrationData);

      toast.success(
        `Welcome! Registered as ${formData.role === "service_provider" ? "Driver" : "Resident"}.`,
      );

      // Redirect to Login so they can get their token
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      const errorData = error.response?.data;

      if (typeof errorData === "object" && errorData !== null) {
        // Handle Django dictionary errors
        const firstKey = Object.keys(errorData)[0];
        const message = Array.isArray(errorData[firstKey])
          ? errorData[firstKey][0]
          : errorData[firstKey];
        toast.error(`${firstKey}: ${message}`);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl shadow-lg mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Join RecycleTrack
          </h1>
          <p className="text-gray-600 mt-2">
            Start your journey towards sustainable waste management
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* --- Role Selection Toggle --- */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => toggleRole(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                formData.role === "resident"
                  ? "bg-white text-green-700 shadow-md transform scale-100"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User size={18} /> Resident
            </button>
            <button
              type="button"
              onClick={() => toggleRole(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                formData.role === "service_provider"
                  ? "bg-white text-blue-700 shadow-md transform scale-100"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Truck size={18} /> Driver
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="First Name"
                type="text"
                name="first_name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                icon={User}
              />
              <Input
                label="Last Name"
                type="text"
                name="last_name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                icon={User}
              />
            </div>

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              autoComplete="email"
            />

            {/* Phone and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                placeholder="+254 712 345 678"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={Phone}
              />
              <Input
                label="Location"
                type="text"
                name="location"
                placeholder="Nairobi, Kenya"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
                icon={MapPin}
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={Lock}
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                name="password2"
                placeholder="Re-enter password"
                value={formData.password2}
                onChange={handleChange}
                error={errors.password2}
                icon={Lock}
                autoComplete="new-password"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <Link to="/terms" className="text-green-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Dynamic Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className={`w-full text-white transition-colors ${
                formData.role === "service_provider"
                  ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }`}
              loading={loading}
            >
              {formData.role === "service_provider"
                ? "Register as Driver"
                : "Register as Resident"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Login Instead
            </Button>
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/80 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🎮</div>
            <p className="text-sm font-medium text-gray-900">Earn Points</p>
            <p className="text-xs text-gray-600">Gamified recycling</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🗺️</div>
            <p className="text-sm font-medium text-gray-900">Find Recyclers</p>
            <p className="text-xs text-gray-600">Nearby locations</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">📚</div>
            <p className="text-sm font-medium text-gray-900">Learn More</p>
            <p className="text-xs text-gray-600">Educational resources</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
