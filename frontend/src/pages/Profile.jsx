import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Loader,
  Trash2,
  Lock,
  Shield,
  Key,
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
  const [passLoading, setPassLoading] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);

  // Profile Data State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });

  // Password Data State
  const [passData, setPassData] = useState({
    old_password: "",
    new_password: "",
  });

  useEffect(() => {
    if (user) {
      // --- SMART NAME FILLER ---
      let fName = user.first_name || "";
      let lName = user.last_name || "";

      if ((!fName || !lName) && user.full_name) {
        const parts = user.full_name.trim().split(" ");
        if (parts.length > 0) {
          fName = parts[0];
          lName = parts.slice(1).join(" ");
        }
      }

      // --- POPULATE PHONE & ADDRESS ---
      // We check user.phone and user.address directly now that the backend sends them
      setFormData({
        first_name: fName,
        last_name: lName,
        phone: user.phone || "",
        address: user.address || user.location || "", // Check both just in case
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePassChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  // Submit Profile Update
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.patch("/users/profile/", formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passData.old_password || !passData.new_password) {
      return toast.error("Please fill in both fields");
    }

    setPassLoading(true);
    try {
      await api.post("/users/change-password/", passData);
      toast.success("Password changed! Please log in again.");
      setPassData({ old_password: "", new_password: "" });
      setShowPassForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  const inputBoxClass = isEditing
    ? "bg-white border-green-500 ring-1 ring-green-500"
    : "bg-gray-50 border-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">Manage your account settings</p>
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
                <Edit2 size={16} className="mr-2" /> Edit Details
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1. PERSONAL INFO */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Personal Information">
              <div className="space-y-6">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full p-2 border border-green-500 rounded focus:ring-2 focus:ring-green-200 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium p-2 bg-gray-50 rounded border border-gray-100">
                        {formData.first_name || "N/A"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full p-2 border border-green-500 rounded focus:ring-2 focus:ring-green-200 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium p-2 bg-gray-50 rounded border border-gray-100">
                        {formData.last_name || "N/A"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Mail className="text-gray-400" size={20} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Email Address
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </p>
                  </div>
                  <Lock size={14} className="text-gray-400" />
                </div>

                {/* Phone */}
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${inputBoxClass}`}
                >
                  <Phone
                    className={`${isEditing ? "text-green-600" : "text-gray-400"}`}
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
                        className="w-full bg-transparent outline-none text-sm font-medium text-gray-900"
                        placeholder="+254 7..."
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">
                        {formData.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${inputBoxClass}`}
                >
                  <MapPin
                    className={`${isEditing ? "text-green-600" : "text-gray-400"}`}
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
                        className="w-full bg-transparent outline-none text-sm font-medium text-gray-900"
                        placeholder="Nairobi, Kenya"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">
                        {formData.address || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 2. ACTIONS */}
          <div className="space-y-6">
            <Card title="Security & Actions">
              <div className="space-y-4">
                {!showPassForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowPassForm(true)}
                    className="w-full justify-start hover:bg-gray-50 border-gray-200"
                  >
                    <Key size={16} className="mr-2 text-gray-500" /> Change
                    Password
                  </Button>
                ) : (
                  <form
                    onSubmit={handleChangePassword}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in"
                  >
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Lock size={14} /> Update Password
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        name="old_password"
                        placeholder="Current Password"
                        value={passData.old_password}
                        onChange={handlePassChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:border-green-500 outline-none"
                      />
                      <input
                        type="password"
                        name="new_password"
                        placeholder="New Password"
                        value={passData.new_password}
                        onChange={handlePassChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:border-green-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowPassForm(false)}
                        className="flex-1 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passLoading}
                        className="flex-1 py-2 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 flex justify-center items-center"
                      >
                        {passLoading ? (
                          <Loader size={12} className="animate-spin" />
                        ) : (
                          "Update"
                        )}
                      </button>
                    </div>
                  </form>
                )}
                <div className="border-t border-gray-100 my-2"></div>
                <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white shadow-none border-none">
                  <Trash2 size={16} className="mr-2" /> Delete Account
                </Button>
              </div>
            </Card>

            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full text-green-700">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-green-900">
                  Account Active
                </p>
                <p className="text-xs text-green-700">
                  Your account is fully verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
