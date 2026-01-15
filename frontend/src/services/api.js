const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Helper to get auth headers (Fixed to allow FormData)
const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("access_token");
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set JSON content type if it's NOT a file upload
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Helper to handle token refresh
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

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
};

// Main API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(isFormData),
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // Handle 401 - try to refresh token (EXCEPT for login attempts)
  if (
    response.status === 401 &&
    !options._retry &&
    !endpoint.includes("login")
  ) {
    try {
      await refreshAccessToken();
      config.headers = {
        ...getAuthHeaders(isFormData),
        ...options.headers,
      };
      config._retry = true;
      response = await fetch(url, config);
    } catch (error) {
      localStorage.clear();
      // Optional: Redirect to login
      // window.location.href = "/login";
      throw error;
    }
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data.detail || data.message || "API request failed";
    throw new Error(errorMessage);
  }

  return data;
};

export const api = {
  get: (endpoint, options) =>
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

  delete: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

// --- UPDATED ARTICLE API ---
export const articleAPI = {
  getAll: () => api.get("/education/articles/"),
  // ADDED: Get Single Article by ID
  getById: (id) => api.get(`/education/articles/${id}/`),
  create: (data) => api.post("/education/articles/", data),
  update: (id, data) => api.patch(`/education/articles/${id}/`, data),
  delete: (id) => api.delete(`/education/articles/${id}/`),
  getCategories: () => api.get("/education/articles/categories/"),
};

export default api;
