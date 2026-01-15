import React from "react";

const ManageCenters = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recycling Centers</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + Add New Center
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm text-center border-dashed border-2 border-gray-300">
        <p className="text-gray-500 mb-2">
          Map management integration coming soon.
        </p>
        <p className="text-sm text-gray-400">
          This page will allow admins to add coordinates (Lat/Lng) for new
          collection points.
        </p>
      </div>
    </div>
  );
};

export default ManageCenters;
