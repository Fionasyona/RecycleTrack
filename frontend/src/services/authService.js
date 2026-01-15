import api from "./api";

// Define the prefix based on your Django Project urls.py
const USERS_URL = "/users";

const register = async (userData) => {
  // Final URL: /api/users/auth/register/
  const data = await api.post(`${USERS_URL}/auth/register/`, userData);
  return data;
};

const login = async (credentials) => {
  // Final URL: /api/users/auth/login/
  const data = await api.post(`${USERS_URL}/auth/login/`, credentials);

  if (data.access) {
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    const userObj = data.user || {
      first_name: "User",
      email: credentials.email,
    };

    localStorage.setItem("user", JSON.stringify(userObj));

    return {
      user: userObj,
      ...data,
    };
  }

  return data;
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return null;
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
};
