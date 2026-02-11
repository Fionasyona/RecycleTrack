const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

// Helper: Get Auth Headers
const getAuthHeaders = (contentType = "application/json") => {
  const token = localStorage.getItem("access_token");
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If contentType is null (for FormData), the browser sets it automatically
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
};

// Helper: Refresh Token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  } catch (error) {
    localStorage.clear();
    window.location.href = "/login";
    throw error;
  }
};

// Main API Request Handler
const apiRequest = async (endpoint, options = {}) => {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const isFormData = options.body instanceof FormData;
  const contentType = isFormData ? null : "application/json";

  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(contentType),
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // Handle 401 Unauthorized (Token Expiry) - Retry once
  if (response.status === 401 && !options._retry && !path.includes("login")) {
    try {
      await refreshAccessToken();
      config._retry = true;
      config.headers = {
        ...getAuthHeaders(contentType),
        ...options.headers,
      };
      response = await fetch(url, config);
    } catch (refreshError) {
      throw refreshError;
    }
  }

  if (response.status === 204) return null;

  // Parse Response
  const responseType = response.headers.get("content-type");
  let data;
  if (responseType && responseType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Handle Errors
  if (!response.ok) {
    // Create an error object that mimics Axios structure for easier debugging
    const error = new Error(data.detail || "API Request Failed");
    error.response = {
      data: data,
      status: response.status,
      headers: response.headers,
    };
    throw error;
  }

  return data;
};

// --- API Methods ---

export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  put: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  patch: (endpoint, data, options = {}) => {
    const isFormData = data instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

// --- Domain Specific APIs ---

export const articleAPI = {
  getAll: () => api.get("/education/articles/"),
  getById: (id) => api.get(`/education/articles/${id}/`),
  create: (data) => api.post("/education/articles/", data),
  update: (id, data) => api.patch(`/education/articles/${id}/`, data),
  delete: (id) => api.delete(`/education/articles/${id}/`),
  getCategories: () => api.get("/education/articles/categories/"),
};

export const centerAPI = {
  getAll: () => api.get("/centers/locations/"),
  create: (data) => api.post("/centers/locations/", data),
  update: (id, data) => api.patch(`/centers/locations/${id}/`, data),
  delete: (id) => api.delete(`/centers/locations/${id}/`),
};

export default api;
