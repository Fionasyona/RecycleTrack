import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await api.get("/users/profile/");
          setUser(res.data || res);
        } catch (error) {
          console.error("Auth Check Failed:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  // Login Function
  const login = async (emailOrUsername, password) => {
    // FIX: Send BOTH 'username' and 'email' keys.
    // This effectively "shotguns" the backend: if it wants a username, it gets it.
    // If it wants an email, it gets that too.
    const payload = {
      username: emailOrUsername,
      email: emailOrUsername,
      password: password,
    };

    try {
      const res = await api.post("/users/auth/login/", payload);
      const data = res.data || res;

      if (!data.access) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      // Save tokens
      localStorage.setItem("access_token", data.access);
      if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

      // Set User State
      if (data.user) {
        setUser(data.user);
        return data.user;
      } else {
        // Fallback: If login endpoint didn't return user data, fetch profile
        const profileRes = await api.get("/users/profile/");
        const userData = profileRes.data || profileRes;
        setUser(userData);
        return userData;
      }
    } catch (error) {
      // Retrow error so Login.jsx can display the specific message
      console.error("Login Context Error:", error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
