import { User, Mail, Phone, MapPin, Edit2, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
              <Button variant="outline" className="w-full">
                <Edit2 size={16} />
                Edit Profile
              </Button>
            </div>
          </Card>

          {/* Account Information */}
          <Card title="Account Information" className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.location || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
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

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card title="Statistics">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Points</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Badges Earned</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recycling Reports</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
            </div>
          </Card>

          <Card title="Account Actions">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Notification Settings
              </Button>
              <Button variant="danger" className="w-full justify-start">
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
