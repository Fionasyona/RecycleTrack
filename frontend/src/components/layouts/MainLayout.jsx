import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. The Navbar stays fixed at the top for all user pages */}
      <Navbar />

      {/* 2. The Outlet renders the actual page content (Home, Dashboard, etc.) */}
      <div className="p-0">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
