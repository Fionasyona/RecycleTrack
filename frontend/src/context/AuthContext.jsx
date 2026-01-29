import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/users/profile/");
          // Robust check: handle if 'res' is the data or 'res.data' is the data
          setUser(res.data || res);
        } catch (error) {
          console.error("Auth Check Failed:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    // 1. Post Credentials
    const res = await api.post("/users/auth/login/", { email, password });

    // --- FIX: Handle Unwrapped Response ---
    // If res.data exists, use it. If not, 'res' itself is likely the data.
    const data = res.data || res;
    // --------------------------------------

    if (!data.access) {
      throw new Error("Login failed: No access token received.");
    }

    // 2. Save Token
    localStorage.setItem("token", data.access);

    // 3. Set User State Immediately (Optimized)
    // We configured the backend to send the 'user' object with the login response.
    // This saves us an extra network call.
    if (data.user) {
      setUser(data.user);
    } else {
      // Fallback: If backend didn't send user object, fetch it now
      const profileRes = await api.get("/users/profile/");
      setUser(profileRes.data || profileRes);
    }

    return true;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
