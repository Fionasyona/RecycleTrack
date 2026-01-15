import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check for logged-in user on app start
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Auth Init Error:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      console.log("SENDING LOGIN REQUEST:", { email, password });

      // Send email as 'username' to satisfy Django
      const payload = {
        username: email.trim(),
        password: password,
      };

      const response = await api.post("/users/auth/login/", payload);

      console.log("LOGIN SUCCESS:", response);

      const { access, refresh, user: userData } = response;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      return userData;
    } catch (error) {
      console.error("Login Error in Context:", error);
      throw error;
    }
  };

  // 3. Register Function (ADDED THIS)
  const register = async (formData) => {
    try {
      console.log("REGISTERING USER:", formData);

      // 1. Create the account
      // Ensure your backend URL matches exactly (e.g., /users/register/)
      await api.post("/users/register/", formData);

      // 2. Automatically log the user in
      await login(formData.email, formData.password);
    } catch (error) {
      console.error("Registration Error in Context:", error);
      throw error;
    }
  };

  // 4. Logout Function
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    // Optional: Redirect to login if you want to force it here
    // window.location.href = '/login';
  };

  return (
    // Added 'register' to the value object
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
