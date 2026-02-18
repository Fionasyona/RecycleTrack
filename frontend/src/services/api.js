const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

// Helper: Get Auth Headers
const getAuthHeaders = (contentType = "application/json") => {
  const token = localStorage.getItem("access_token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
};

// Helper: Refresh Token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Token refresh failed");

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
  const { params, ...fetchOptions } = options;
  let path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // FIXED: Handle Query Parameters (for filtering)
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    path += `?${queryString}`;
  }

  const url = `${API_BASE_URL}${path}`;
  const isFormData = fetchOptions.body instanceof FormData;
  const contentType = isFormData ? null : "application/json";

  const config = {
    ...fetchOptions,
    headers: { ...getAuthHeaders(contentType), ...fetchOptions.headers },
  };

  let response = await fetch(url, config);

  if (response.status === 401 && !options._retry && !path.includes("login")) {
    try {
      await refreshAccessToken();
      response = await fetch(url, {
        ...config,
        _retry: true,
        headers: { ...getAuthHeaders(contentType), ...options.headers },
      });
    } catch (refreshError) {
      throw refreshError;
    }
  }

  if (response.status === 204) return null;
  const responseType = response.headers.get("content-type");
  const data =
    responseType && responseType.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const error = new Error(data.detail || "API Request Failed");
    error.response = { data, status: response.status };
    throw error;
  }
  return data;
};

export const api = {
  get: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint, data, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  put: (endpoint, data, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  patch: (endpoint, data, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

// --- Domain Specific APIs ---
export const articleAPI = {
  getAll: (params) => api.get("/education/articles/", { params }),
  getById: (id) => api.get(`/education/articles/${id}/`),
  getCategories: () => api.get("/education/categories/"),
};

export const videoAPI = {
  getAll: (params) => api.get("/education/videos/", { params }),
  getById: (id) => api.get(`/education/videos/${id}/`),
};

// FIXED: Added missing centerAPI export for the Dashboard
export const centerAPI = {
  getAll: () => api.get("/centers/locations/"),
  create: (data) => api.post("/centers/locations/", data),
  update: (id, data) => api.patch(`/centers/locations/${id}/`, data),
  delete: (id) => api.delete(`/centers/locations/${id}/`),
};

export default api;
