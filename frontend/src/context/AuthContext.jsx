import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      // 1. Look for the correct key name "access_token"
      const token = localStorage.getItem("access_token");

      if (token) {
        try {
          const res = await api.get("/users/profile/");
          setUser(res.data || res);
        } catch (error) {
          console.error("Auth Check Failed:", error);
          // 2. Clear the correct keys on failure
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/users/auth/login/", { email, password });
    const data = res.data || res;

    if (!data.access) {
      throw new Error("Login failed: No access token received.");
    }

    // 3. Save tokens with the names api.js expects
    localStorage.setItem("access_token", data.access);

    if (data.refresh) {
      localStorage.setItem("refresh_token", data.refresh);
    } else {
      console.warn("Backend did not send a refresh token!");
    }

    // 4. Update State & RETURN THE USER OBJECT (Critical Fix)
    if (data.user) {
      setUser(data.user);
      return data.user; // <--- Returns user object to Login.jsx
    } else {
      // Fallback: fetch profile if login response didn't include user data
      const profileRes = await api.get("/users/profile/");
      const userData = profileRes.data || profileRes;
      setUser(userData);
      return userData; // <--- Returns user object to Login.jsx
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
