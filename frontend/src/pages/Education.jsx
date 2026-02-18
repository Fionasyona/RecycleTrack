import {
  BookOpen,
  Filter,
  Search,
  X,
  Play,
  MonitorPlay,
  Clock,
  Loader,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Button } from "../components/common/Button";
import ArticleCard from "../components/education/ArticleCard";
// FIXED: Import the specific API helpers instead of just the raw api instance
import { articleAPI, videoAPI } from "../services/api";

const Education = () => {
  const [activeTab, setActiveTab] = useState("articles"); // 'articles' | 'videos'
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableCategories, setAvailableCategories] = useState(["All"]);

  // State for Video Modal
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedCategory, activeTab]);

  const loadCategories = async () => {
    try {
      // FIXED: Uses articleAPI helper which calls /api/education/categories/
      const data = await articleAPI.getCategories();
      if (data) {
        // Ensure we handle both string arrays and object arrays
        const categoryNames = data.map((cat) =>
          typeof cat === "string" ? cat : cat.name,
        );
        // We use a Set to ensure "All" is first and there are no duplicates
        const uniqueCategories = Array.from(new Set(["All", ...categoryNames]));
        setAvailableCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
      // Fallback categories including the new waste types
      setAvailableCategories([
        "All",
        "Plastic",
        "Metal",
        "Organic",
        "E-waste",
        "Glass",
        "Paper",
        "Recycling",
        "Sustainability",
        "Innovation",
      ]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== "All") {
        params.category = selectedCategory;
      }

      if (activeTab === "articles") {
        // FIXED: Uses articleAPI.getAll() to ensure /api/education/articles/ path
        const data = await articleAPI.getAll(params);
        setArticles(data);
      } else {
        // FIXED: Uses videoAPI.getAll() to ensure /api/education/videos/ path
        const data = await videoAPI.getAll(params);
        setVideos(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = useMemo(() => {
    const data = activeTab === "articles" ? articles : videos;
    if (!searchQuery) return data;

    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.channel &&
          item.channel.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [articles, videos, searchQuery, activeTab]);

  return (
    // Parent container is locked to screen height and prevents body scroll
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden relative">
      {/* 1. FIXED TOP NAV & SEARCH */}
      <header className="flex-none bg-white border-b border-gray-200 z-30 pt-6 pb-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* TABS SWITCHER */}
            <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActiveTab("articles")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "articles"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BookOpen size={18} />
                Articles
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "videos"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MonitorPlay size={18} />
                Videos
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative flex-1 group w-full md:max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none text-gray-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold text-gray-400 uppercase mr-2 hidden sm:block">
              Filters:
            </span>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                  selectedCategory === category
                    ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. SCROLLABLE CONTENT SECTION */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Header for results count */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {selectedCategory === "All"
                  ? `Latest ${activeTab}`
                  : `${selectedCategory} ${activeTab}`}
              </h2>
              <p className="text-sm text-gray-500">
                Showing {filteredContent.length} results
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"
                />
              ))}
            </div>
          ) : filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {activeTab === "articles"
                ? // --- ARTICLE CARDS ---
                  filteredContent.map((article) => (
                    <div
                      key={article.id}
                      className="transition-all hover:scale-[1.02]"
                    >
                      <ArticleCard article={article} />
                    </div>
                  ))
                : // --- VIDEO CARDS ---
                  filteredContent.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden cursor-pointer hover:scale-[1.02]"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video bg-gray-200 overflow-hidden">
                        <img
                          src={video.thumbnail} // Serializer now provides this URL correctly
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center pl-1 group-hover:scale-110 transition-transform shadow-lg">
                            <Play
                              fill="currentColor"
                              className="text-green-600"
                              size={20}
                            />
                          </div>
                        </div>
                        {/* Duration Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                          <Clock size={10} /> {video.duration}
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {video.category_name || "General"}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-green-700 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          By{" "}
                          <span className="font-medium">{video.channel}</span>
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No results found
              </h3>
              <p className="text-gray-500">
                Try changing your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 3. VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Close Button (Top Right) */}
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
          >
            <X size={32} />
          </button>

          <div className="w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {/* YouTube Iframe */}
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Video Footer Info */}
            <div className="p-6 bg-gray-900 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {selectedVideo.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {selectedVideo.channel} • {selectedVideo.category_name}
                </p>
              </div>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => setSelectedVideo(null)}
              >
                Close Player
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;
