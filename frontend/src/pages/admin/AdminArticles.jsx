import React, { useState, useEffect } from "react";
// FIX: Import videoAPI along with articleAPI
import { articleAPI, videoAPI } from "../../services/api";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import {
  Plus,
  Edit,
  Trash,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  PlayCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

// --- 1. HARDCODED CATEGORIES ---
const TRASH_CATEGORIES = ["Plastic", "Organic", "Paper", "Metal", "E-waste"];

const AdminArticles = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("articles"); // 'articles' | 'videos'
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null); // ID of item being edited

  // Article Form State
  const [articleData, setArticleData] = useState({
    title: "",
    content: "",
    category: "",
    image: null,
  });

  // Video Form State
  const [videoData, setVideoData] = useState({
    title: "",
    youtube_id: "",
    channel: "",
    duration: "",
    category: "",
  });

  useEffect(() => {
    if (activeTab === "articles") fetchArticles();
    else fetchVideos();
  }, [activeTab]);

  // --- API FETCHING ---
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await articleAPI.getAll();
      setArticles(Array.isArray(res) ? res : res.results || []);
    } catch (error) {
      toast.error("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      // FIX: Use videoAPI instead of raw api.get("/videos/")
      // This ensures we hit /education/videos/ instead of just /videos/
      const res = await videoAPI.getAll();
      setVideos(Array.isArray(res) ? res : res.results || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load videos.");
    } finally {
      setLoading(false);
    }
  };

  // --- SUBMIT HANDLERS ---
  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", articleData.title);
    data.append("content", articleData.content);
    if (articleData.category) data.append("category", articleData.category);
    if (articleData.image instanceof File) {
      data.append("featured_image", articleData.image);
    }

    try {
      setLoading(true);
      if (currentId) {
        await articleAPI.update(currentId, data);
        toast.success("Article Updated!");
      } else {
        await articleAPI.create(data);
        toast.success("Article Created!");
      }
      resetForm();
      fetchArticles();
    } catch (error) {
      toast.error("Failed to save article.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentId) {
        // FIX: Use videoAPI.update
        await videoAPI.update(currentId, videoData);
        toast.success("Video Updated!");
      } else {
        // FIX: Use videoAPI.create
        await videoAPI.create(videoData);
        toast.success("Video Added!");
      }
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save video.");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      if (activeTab === "articles") {
        await articleAPI.delete(id);
        fetchArticles();
      } else {
        // FIX: Use videoAPI.delete
        await videoAPI.delete(id);
        fetchVideos();
      }
      toast.success("Item Deleted");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  // --- EDIT HELPERS ---
  const startEdit = (item) => {
    setCurrentId(item.id);
    setIsEditing(true);

    if (activeTab === "articles") {
      setArticleData({
        title: item.title,
        content: item.content,
        category: item.category_name || "",
        image: item.featured_image,
      });
    } else {
      setVideoData({
        title: item.title,
        youtube_id: item.youtube_id,
        channel: item.channel,
        duration: item.duration,
        category: item.category_name || "",
      });
    }
  };

  const resetForm = () => {
    setArticleData({ title: "", content: "", category: "", image: null });
    setVideoData({
      title: "",
      youtube_id: "",
      channel: "",
      duration: "",
      category: "",
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const getThumbnail = (id) =>
    `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Education Content</h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("articles");
              resetForm();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === "articles"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText size={18} /> Articles
          </button>
          <button
            onClick={() => {
              setActiveTab("videos");
              resetForm();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === "videos"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Video size={18} /> Videos
          </button>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-5 h-5 mr-2" /> Add{" "}
            {activeTab === "articles" ? "Article" : "Video"}
          </Button>
        )}
      </div>

      {/* --- FORMS --- */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {currentId ? "Edit" : "Add New"}{" "}
              {activeTab === "articles" ? "Article" : "Video"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {activeTab === "articles" ? (
            /* --- ARTICLE FORM --- */
            <form onSubmit={handleArticleSubmit} className="space-y-6">
              <Input
                label="Article Title"
                value={articleData.title}
                onChange={(e) =>
                  setArticleData({ ...articleData, title: e.target.value })
                }
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                  value={articleData.category}
                  onChange={(e) =>
                    setArticleData({ ...articleData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category...</option>
                  {TRASH_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Markdown)
                </label>
                <textarea
                  rows="6"
                  className="w-full rounded-lg border-gray-300 shadow-sm p-3 border"
                  value={articleData.content}
                  onChange={(e) =>
                    setArticleData({ ...articleData, content: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setArticleData({
                      ...articleData,
                      image: e.target.files[0],
                    })
                  }
                  accept="image/*"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" loading={loading}>
                  Save Article
                </Button>
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            /* --- VIDEO FORM --- */
            <form onSubmit={handleVideoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Video Title"
                  value={videoData.title}
                  onChange={(e) =>
                    setVideoData({ ...videoData, title: e.target.value })
                  }
                  required
                />
                <Input
                  label="Channel Name"
                  value={videoData.channel}
                  onChange={(e) =>
                    setVideoData({ ...videoData, channel: e.target.value })
                  }
                  placeholder="e.g. Eco Science"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                      value={videoData.youtube_id}
                      onChange={(e) =>
                        setVideoData({
                          ...videoData,
                          youtube_id: e.target.value,
                        })
                      }
                      placeholder="e.g. dQw4w9WgXcQ"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    The code at the end of the YouTube URL.
                  </p>
                </div>
                <Input
                  label="Duration (MM:SS)"
                  value={videoData.duration}
                  onChange={(e) =>
                    setVideoData({ ...videoData, duration: e.target.value })
                  }
                  placeholder="e.g. 10:15"
                  required
                />
              </div>

              {videoData.youtube_id && (
                <div className="w-40 aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={getThumbnail(videoData.youtube_id)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                  value={videoData.category}
                  onChange={(e) =>
                    setVideoData({ ...videoData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category...</option>
                  {TRASH_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" loading={loading}>
                  Save Video
                </Button>
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* --- CONTENT LIST --- */}
      {activeTab === "articles" ? (
        /* ARTICLES GRID */
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
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit mb-2">
                  {article.category_name}
                </span>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {new Date(article.published_date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!loading && articles.length === 0 && !isEditing && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No articles found.
            </div>
          )}
        </div>
      ) : (
        /* VIDEOS GRID */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden flex flex-col group"
            >
              <div className="h-48 bg-black w-full relative">
                <img
                  src={getThumbnail(video.youtube_id)}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <PlayCircle className="w-12 h-12 text-white opacity-80" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <Clock size={10} /> {video.duration}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit mb-2">
                  {video.category_name || "General"}
                </span>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">{video.channel}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {new Date(video.published_date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(video)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!loading && videos.length === 0 && !isEditing && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No videos found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminArticles;