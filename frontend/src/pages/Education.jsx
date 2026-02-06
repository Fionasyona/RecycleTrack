import { BookOpen, Filter, Search, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Button } from "../components/common/Button";
import ArticleCard from "../components/education/ArticleCard";
import educationService from "../services/educationService";

const Education = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = educationService.getCategories();

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const categoryFilter =
        selectedCategory === "All" ? null : selectedCategory;
      const data = await educationService.getArticles(categoryFilter);
      setArticles(data);
    } catch (error) {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [articles, searchQuery]);

  return (
    // Parent container is locked to screen height and prevents body scroll
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* 1. FIXED TOP NAV & SEARCH */}
      <header className="flex-none bg-white border-b border-gray-200 z-30 pt-6 pb-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Minimal Search Input */}
            <div className="relative flex-1 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search articles..."
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

            {/* Compact Search Button */}
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 shadow-md">
              Search
            </Button>
          </div>

          {/* Category Chips - Inline with search for a slim profile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold text-gray-400 uppercase mr-2 hidden sm:block">
              Filters:
            </span>
            {categories.map((category) => (
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
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategory === "All"
                  ? "Latest Articles"
                  : selectedCategory}
              </h2>
              <p className="text-sm text-gray-500">
                Showing {filteredArticles.length} results
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
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="transition-all hover:scale-[1.02]"
                >
                  <ArticleCard article={article} />
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
    </div>
  );
};

export default Education;
