import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Camera,
  Save,
  X,
  Loader,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { api } from "../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        address: user.address || user.location || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.patch("/users/profile/", formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Helper class for the input boxes to ensure they look exactly like the Email box
  const inputBoxClass = isEditing
    ? "bg-white border-green-500 ring-1 ring-green-500"
    : "bg-gray-50 border-gray-100"; // This matches the Email style exactly

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <X size={16} className="mr-2" /> Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <Loader className="animate-spin mr-2" size={16} />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit2 size={16} className="mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. PROFILE PHOTO CARD */}
          <Card className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <User className="w-12 h-12 text-green-600" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors shadow-sm">
                  <Camera size={16} />
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-2 mb-4 px-4">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full p-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full p-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              ) : (
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {formData.first_name} {formData.last_name}
                </h2>
              )}

              <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
            </div>
          </Card>

          {/* 2. DETAILS CARD */}
          <Card title="Account Information" className="lg:col-span-2">
            <div className="space-y-4">
              {/* Email (Standard Reference) */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Mail className="text-gray-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Phone (Now matches Email style) */}
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${inputBoxClass}`}
              >
                <Phone
                  className={`${
                    isEditing ? "text-green-600" : "text-gray-400"
                  }`}
                  size={20}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Phone
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 placeholder-gray-400"
                      placeholder="+254 7..."
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formData.phone || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              {/* Location (Now matches Email style) */}
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${inputBoxClass}`}
              >
                <MapPin
                  className={`${
                    isEditing ? "text-green-600" : "text-gray-400"
                  }`}
                  size={20}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Location
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 placeholder-gray-400"
                      placeholder="e.g. Nairobi, Kenya"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {formData.address || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <User className="text-gray-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Member Since
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.date_joined
                      ? new Date(user.date_joined).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 3. SETTINGS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card title="Statistics">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <span className="text-sm text-gray-600">Total Points</span>
                <span className="font-bold text-green-600">
                  {user?.points || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <span className="text-sm text-gray-600">Badges Earned</span>
                <span className="font-bold text-gray-900">0</span>
              </div>
            </div>
          </Card>

          <Card title="Account Actions">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-gray-50"
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-gray-50"
              >
                Notification Settings
              </Button>

              {/* FIXED DELETE BUTTON: Solid Red, No Shadow/Cast */}
              <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white shadow-none border-none">
                <Trash2 size={16} className="mr-2" />
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
