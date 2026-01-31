import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// --- Layouts ---
import AdminLayout from "./components/layouts/AdminLayout";
import MainLayout from "./components/layouts/MainLayout";

// --- Guards ---
// WE USE THE NEW ROLE GUARD NOW
import RoleGuard from "./components/auth/RoleGuard";

// --- Pages: Public & User ---
import ArticleDetail from "./pages/education/ArticleDetail";
import Dashboard from "./pages/Dashboard";
import Education from "./pages/Education";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import BookPickup from "./pages/BookPickup";

// --- Pages: Admin ---
import AdminDashboard from "./pages/AdminDashboard";
import UsersManagement from "./pages/UsersManagement";
import ManageCenters from "./pages/admin/ManageCenters";
import AdminArticles from "./pages/admin/AdminArticles";

//--- Pages: Collector ---
import CollectorDashboard from "./pages/CollectorDashboard";
import CollectorsManagement from "./pages/CollectorsManagement";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* =======================================================
              SECTION 1: PUBLIC ROUTES
             ======================================================= */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/education" element={<Education />} />
            <Route path="/education/:id" element={<ArticleDetail />} />
          </Route>

          {/* =======================================================
              SECTION 2: RESIDENT / USER ROUTES
              Allowed: "resident", "admin", "service_provider"
             ======================================================= */}
          <Route element={<MainLayout />}>
            <Route
              element={
                <RoleGuard
                  allowedRoles={["resident", "admin", "service_provider"]}
                />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/maps" element={<MapView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/book-pickup" element={<BookPickup />} />
            </Route>
          </Route>

          {/* =======================================================
              SECTION 3: COLLECTOR (DRIVER) PORTAL
              Allowed: ONLY "service_provider"
             ======================================================= */}
          <Route element={<RoleGuard allowedRoles={["service_provider"]} />}>
            {/* Note: You can create a CollectorLayout if you want a specific sidebar for them */}
            <Route path="/driver/dashboard" element={<CollectorDashboard />} />
            {/* Add other driver routes here, e.g., /driver/pickups */}
          </Route>

          {/* =======================================================
              SECTION 4: ADMIN PORTAL
              Allowed: ONLY "admin"
             ======================================================= */}
          <Route path="/admin" element={<RoleGuard allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="collectors" element={<CollectorsManagement />} />
              <Route path="centers" element={<ManageCenters />} />
              <Route path="education" element={<AdminArticles />} />
            </Route>
          </Route>

          {/* =======================================================
              SECTION 5: CATCH-ALL (404)
             ======================================================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: "#fff", color: "#363636" },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
