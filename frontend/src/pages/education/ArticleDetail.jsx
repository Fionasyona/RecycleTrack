import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { articleAPI } from "../../services/api"; // Adjust path if needed
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await articleAPI.getById(id);
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
        navigate("/education");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, navigate]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!article) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        to="/education"
        className="inline-flex items-center text-gray-500 hover:text-green-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Education
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {article.featured_image && (
          <div className="h-64 w-full relative">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <span className="bg-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 inline-block">
                {article.category_name || "General"}
              </span>
              <h1 className="text-3xl font-bold">{article.title}</h1>
            </div>
          </div>
        )}

        <div className="p-8 prose max-w-none whitespace-pre-wrap">
          {article.content}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
