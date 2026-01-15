import React, { useState, useEffect } from "react";
import api from "../services/api"; // Using your generic api handler

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    // You'll need to create this endpoint in Django: path('api/users/all/', ...)
    // For now, this is ready to receive data
    const fetchUsers = async () => {
      try {
        // const response = await api.get('/users/all/');
        // setUsers(response);

        // MOCK DATA FOR UI DEMO
        setUsers([
          {
            id: 1,
            full_name: "Ben Wambua",
            email: "ben@test.com",
            role: "resident",
            status: "Active",
          },
          {
            id: 2,
            full_name: "Admin User",
            email: "admin@test.com",
            role: "admin",
            status: "Active",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-4 font-medium">{user.full_name}</td>
              <td className="p-4 text-gray-600">{user.email}</td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="p-4">
                <span className="text-green-600 text-sm font-medium">
                  {user.status}
                </span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline text-sm mr-3">
                  Edit
                </button>
                <button className="text-red-600 hover:underline text-sm">
                  Ban
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersManagement;
