// src/pages/Education.jsx
import { useState, useEffect } from "react";
import { BookOpen, Search, Filter } from "lucide-react";
import { Button } from "../components/common/Button";
import ArticleCard from "../components/education/ArticleCard";
import educationService from "../services/educationService";
import toast from "react-hot-toast";

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
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      const results = await educationService.searchArticles(searchQuery);
      setArticles(results);
    } catch (error) {
      toast.error("Search failed");
      console.error("Search error:", error);
    }
  };

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary-600 p-4 rounded-2xl">
              <BookOpen className="text-white" size={36} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Education Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn about recycling, sustainability, and how you can make a
            difference
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading articles...</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === "All"
                  ? "All Articles"
                  : `${selectedCategory} Articles`}
                <span className="ml-3 text-lg text-gray-500">
                  ({filteredArticles.length})
                </span>
              </h2>
            </div>

            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl">
                <BookOpen size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl text-gray-600 mb-2">No articles found</p>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h3>
          <p className="text-xl mb-8 text-primary-100">
            Put your knowledge into action and start earning rewards!
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-white text-primary-600 hover:bg-gray-100"
              size="lg"
            >
              Start Recycling
            </Button>
            <Button
              onClick={() => (window.location.href = "/map")}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600"
              size="lg"
            >
              Find Centers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
