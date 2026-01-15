import api from "./api";

export const adminService = {
  // Get all categories
  getWasteCategories: async () => {
    return await api.get("/recycling/categories/");
  },

  // Add a new category
  addWasteCategory: async (data) => {
    return await api.post("/recycling/categories/", data);
  },

  // Delete a category
  deleteWasteCategory: async (id) => {
    return await api.delete(`/recycling/categories/${id}/`);
  },
};
