import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// --- Layouts ---
import AdminLayout from "./components/layouts/AdminLayout";
import MainLayout from "./components/layouts/MainLayout";

// --- Guards ---
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
import CollectorsManagement from "./pages/CollectorsManagement";

//--- Pages: Collector ---
import CollectorDashboard from "./pages/CollectorDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* =======================================================
              SECTION 1: PUBLIC ROUTES (No Auth Required)
              ======================================================= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* =======================================================
              SECTION 1: PUBLIC ROUTES (Wrapped in MainLayout)
              ======================================================= */}
          <Route element={<MainLayout />}>
            
            <Route path="/education" element={<Education />} />
            <Route path="/education/:id" element={<ArticleDetail />} />
          </Route>

          {/* =======================================================
              SECTION 2: RESIDENT / USER ROUTES (Protected + MainLayout)
              Allowed: "resident", "admin", "service_provider"
              ======================================================= */}
          <Route
            element={
              <RoleGuard
                allowedRoles={["resident", "admin", "service_provider"]}
              />
            }
          >
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/maps" element={<MapView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/book-pickup" element={<BookPickup />} />
            </Route>
          </Route>

          {/* =======================================================
              SECTION 3: COLLECTOR (DRIVER) PORTAL
              Allowed: ONLY "service_provider"
              Note: CollectorDashboard has its own internal Sidebar/Layout
              ======================================================= */}
          <Route element={<RoleGuard allowedRoles={["service_provider"]} />}>
            <Route path="/driver/dashboard" element={<CollectorDashboard />} />
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
