import React from "react";
import { Clock, Eye, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ArticleCard = ({ article }) => {
  if (!article) return null;

  // Safe checks to prevent crashes
  const title = article.title || "Untitled";
  const category = article.category_name || "General";
  const date = article.published_date
    ? new Date(article.published_date).toLocaleDateString()
    : "Recent";
  const readTime = article.reading_time || 1;
  const views = article.views || 0;

  // Create a preview snippet
  const rawText = article.excerpt || article.content || "";
  const previewText =
    rawText.length > 100 ? rawText.slice(0, 100) + "..." : rawText;

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case "plastic":
        return "bg-blue-100 text-blue-800";
      case "organic":
        return "bg-green-100 text-green-800";
      case "metal":
        return "bg-gray-100 text-gray-800";
      case "paper":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group">
      {/* Image */}
      <div className="h-48 overflow-hidden relative bg-gray-100">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
            ♻️
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getCategoryColor(
              category
            )}`}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {readTime} min
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          <Link
            to={`/education/${article.id}`}
            className="hover:text-green-600 transition-colors"
          >
            {title}
          </Link>
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {previewText}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
          <span className="text-xs font-medium text-gray-900">
            {article.author || "Team"}
          </span>
          <Link
            to={`/education/${article.id}`}
            className="flex items-center text-sm font-semibold text-green-600 hover:text-green-700 gap-1"
          >
            Read Article <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
