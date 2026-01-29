import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  User,
  CheckCircle,
  XCircle,
  Loader,
  Power, // Added Power icon for deactivation
} from "lucide-react";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch All Users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/users/");
      console.log("Users API Response:", res);

      const data = Array.isArray(res) ? res : res.data;

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        console.error("API did not return a list:", res);
      }
    } catch (error) {
      console.error("Failed to load users", error);
      toast.error("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Handle Deactivate/Activate Toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    // Determine action name based on current status
    const action = currentStatus ? "Deactivate" : "Activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action.toLowerCase()} this user? They will ${currentStatus ? "lose" : "regain"} access to the system.`,
      )
    )
      return;

    try {
      await api.patch(`/users/users/${userId}/status/`);
      toast.success(`User ${action}d successfully!`);

      // Update UI locally without refreshing
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_active: !u.is_active } : u,
        ),
      );
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Users className="w-6 h-6 text-green-600" /> User Management
          </h1>
          <p className="text-sm text-gray-500">
            View and manage all registered residents and admins.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search email or name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Loader className="w-8 h-8 animate-spin text-green-600 mb-2" />
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Points</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                            {user.full_name ? (
                              user.full_name[0].toUpperCase()
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {user.full_name || "Unknown Name"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role || "Resident"}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-600">
                        {user.points} pts
                      </td>
                      <td className="p-4">
                        {/* Status Badge */}
                        {user.is_active ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded w-fit border border-green-100">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200">
                            <Power className="w-3 h-3" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() =>
                            handleToggleStatus(user.id, user.is_active)
                          }
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 ml-auto w-fit ${
                            user.is_active
                              ? "text-red-600 bg-red-50 hover:bg-red-100 border border-red-100"
                              : "text-green-600 bg-green-50 hover:bg-green-100 border border-green-100"
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <Power className="w-3 h-3" /> Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-gray-500 italic"
                    >
                      No users found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
