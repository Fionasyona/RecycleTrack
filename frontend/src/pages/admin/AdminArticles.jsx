import React, { useState, useEffect } from "react";
import { articleAPI } from "../../services/api";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Plus, Edit, Trash, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

// --- 1. HARDCODED CATEGORIES ---
const TRASH_CATEGORIES = ["Plastic", "Organic", "Paper", "Metal"];

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    image: null,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await articleAPI.getAll();
      let data = [];
      if (Array.isArray(res)) {
        data = res;
      } else if (res && res.results) {
        data = res.results;
      }
      setArticles(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load articles.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);

    // Send the category name directly (e.g., "Plastic")
    if (formData.category) data.append("category", formData.category);

    if (formData.image instanceof File) {
      data.append("featured_image", formData.image);
    }

    try {
      setLoading(true);
      if (currentArticle) {
        await articleAPI.update(currentArticle.id, data);
        toast.success("Article Updated Successfully!");
      } else {
        await articleAPI.create(data);
        toast.success("Article Created Successfully!");
      }
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save article.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;
    try {
      await articleAPI.delete(id);
      toast.success("Article Deleted");
      fetchArticles();
    } catch (error) {
      toast.error("Failed to delete article");
    }
  };

  const startEdit = (article) => {
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category_name || "", // Use category_name from backend
      image: article.featured_image,
    });
    setCurrentArticle(article);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", category: "", image: null });
    setIsEditing(false);
    setCurrentArticle(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Education Content</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-5 h-5 mr-2" /> Add New Article
          </Button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {currentArticle ? "Edit Article" : "Create New Article"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Article Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., 5 Ways to Recycle Plastic"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Select Trash Type...</option>
                {/* --- 2. USE THE HARDCODED LIST --- */}
                {TRASH_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (Markdown supported)
              </label>
              <textarea
                rows="6"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 border"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="# Introduction\n\nWrite your article content here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Choose File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.files[0] })
                    }
                    accept="image/*"
                  />
                </label>
                {formData.image && (
                  <span className="text-sm text-green-600 font-medium">
                    {formData.image instanceof File
                      ? formData.image.name
                      : "Current Image Loaded"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full md:w-auto"
              >
                {currentArticle ? "Update Article" : "Publish Article"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                className="w-full md:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {loading && !articles.length ? (
        <div className="text-center py-12 text-gray-500">
          Loading content...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-gray-100 w-full object-cover relative">
                {article.featured_image ? (
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full 
                      ${
                        article.category_name === "Plastic"
                          ? "bg-blue-100 text-blue-800"
                          : article.category_name === "Organic"
                          ? "bg-green-100 text-green-800"
                          : article.category_name === "Paper"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {article.category_name || "General"}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                  {article.excerpt ||
                    article.content?.substring(0, 100) + "..."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {new Date(article.published_date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {articles.length === 0 && !isEditing && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">
                No articles found. Create your first one!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminArticles;
