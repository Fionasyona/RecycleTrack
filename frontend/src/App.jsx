import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// --- Layouts ---
import AdminLayout from "./components/layouts/AdminLayout";
import MainLayout from "./components/layouts/MainLayout";

// --- Guards ---
import AdminGuard from "./components/auth/AdminGuard";
import ProtectedRoute from "./routes/ProtectedRoute";

// --- Pages: Public & User ---
import ArticleDetail from "./pages/education/ArticleDetail";
import Dashboard from "./pages/Dashboard";
import Education from "./pages/Education";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import Profile from "./pages/Profile";
import Register from "./pages/Register";


// --- Pages: Admin ---
import AdminDashboard from "./pages/AdminDashboard";
import UsersManagement from "./pages/UsersManagement"; // Ensure you create this file if missing
import ManageCenters from "./pages/admin/ManageCenters"; // Ensure you create this file if missing
import AdminArticles from "./pages/admin/AdminArticles"; // Ensure you create this file if missing

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* =======================================================
              SECTION 1: USER APPLICATION (Uses MainLayout)
             ======================================================= */}
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/education" element={<Education />} />

            {/* Dynamic Route for Article Details */}
            <Route path="/education/:id" element={<ArticleDetail />} />

            {/* Protected User Routes (Require Login) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maps"
              element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>


          {/* =======================================================
              SECTION 2: ADMIN PORTAL (Uses AdminLayout)
             ======================================================= */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            {/* The "index" route matches /admin exactly */}
            <Route index element={<AdminDashboard />} />

            {/* Admin Sub-routes */}
            <Route path="users" element={<UsersManagement />} />
            <Route path="centers" element={<ManageCenters />} />
            <Route path="education" element={<AdminArticles />} />
          </Route>

          {/* =======================================================
              SECTION 3: CATCH-ALL (404 Redirect)
             ======================================================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
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
