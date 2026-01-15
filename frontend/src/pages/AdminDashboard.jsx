import React, { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import { toast } from "react-hot-toast";
import { TrendingUp, Users, Trash2, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  // --- Stats State (Mock for now, connect to API later) ---
  const stats = [
    {
      title: "Total Users",
      value: "1,240",
      icon: <Users />,
      color: "bg-blue-500",
    },
    {
      title: "Total Recycled",
      value: "45.2 Tons",
      icon: <Trash2 />,
      color: "bg-green-500",
    },
    {
      title: "Payouts Processed",
      value: "$12,450",
      icon: <DollarSign />,
      color: "bg-yellow-500",
    },
    {
      title: "Active Centers",
      value: "8",
      icon: <TrendingUp />,
      color: "bg-purple-500",
    },
  ];

  // --- Waste Category Logic (Real Data) ---
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: "",
    price_per_kg: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await adminService.getWasteCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load waste categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await adminService.addWasteCategory(newCategory);
      toast.success("Category added successfully");
      setNewCategory({ name: "", price_per_kg: "" });
      loadCategories();
    } catch (err) {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      try {
        await adminService.deleteWasteCategory(id);
        toast.success("Category deleted");
        loadCategories();
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Admin Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4"
          >
            <div className={`${stat.color} p-4 rounded-full text-white`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Waste Management Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            Waste Pricing Manager
          </h2>
        </div>

        {/* Add Form */}
        <form
          onSubmit={handleAddCategory}
          className="bg-slate-50 p-4 rounded-lg mb-6 flex gap-4 items-end"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Category Name
            </label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g. Aluminum Cans"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              required
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">
              Price / Kg ($)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-md px-3 py-2"
              placeholder="0.00"
              value={newCategory.price_per_kg}
              onChange={(e) =>
                setNewCategory({ ...newCategory, price_per_kg: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition"
          >
            Add New
          </button>
        </form>

        {/* Table */}
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="py-3">Category Name</th>
                <th className="py-3">Current Price</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium text-slate-700">
                    {cat.name}
                  </td>
                  <td className="py-3 text-green-600 font-bold">
                    ${cat.price_per_kg} / kg
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
