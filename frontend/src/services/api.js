const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper to handle token refresh
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  localStorage.setItem("accessToken", data.access);
  return data.access;
};

// Main API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // Handle 401 - try to refresh token
  if (response.status === 401 && !options._retry) {
    try {
      await refreshAccessToken();
      // Retry request with new token
      config.headers = {
        ...getAuthHeaders(),
        ...options.headers,
      };
      config._retry = true;
      response = await fetch(url, config);
    } catch (error) {
      localStorage.clear();
      window.location.href = "/login";
      throw error;
    }
  }

  // Parse response
  const contentType = response.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};

// Convenience methods
export const api = {
  get: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint, data, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

export default api;
