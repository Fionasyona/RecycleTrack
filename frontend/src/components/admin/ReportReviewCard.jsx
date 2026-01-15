// src/components/admin/ReportReviewCard.jsx
import { useState } from "react";
import { Check, X, MapPin, Clock, User, Award } from "lucide-react";
import { Button } from "../common/Button";
import adminService from "../../services/adminService";
import toast from "react-hot-toast";

const ReportReviewCard = ({ report, onReviewed }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleVerify = async () => {
    setIsReviewing(true);
    try {
      await adminService.verifyReport(report.id);
      toast.success(
        `Report verified! ${report.points_potential} points awarded to ${report.user.name}`
      );
      if (onReviewed) onReviewed();
    } catch (error) {
      toast.error("Failed to verify report");
      console.error("Error:", error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsReviewing(true);
    try {
      await adminService.rejectReport(report.id, rejectReason);
      toast.success("Report rejected");
      setShowRejectModal(false);
      if (onReviewed) onReviewed();
    } catch (error) {
      toast.error("Failed to reject report");
      console.error("Error:", error);
    } finally {
      setIsReviewing(false);
    }
  };

  const categoryColors = {
    Plastic: "bg-blue-100 text-blue-700",
    "E-waste": "bg-purple-100 text-purple-700",
    Organic: "bg-green-100 text-green-700",
    Paper: "bg-yellow-100 text-yellow-700",
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        {report.image_url && (
          <div className="relative h-48 overflow-hidden bg-gray-100">
            <img
              src={report.image_url}
              alt="Report evidence"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  categoryColors[report.category]
                }`}
              >
                {report.category}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1">
                <Award size={14} />
                {report.points_potential} pts
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {/* Report ID */}
          <div className="mb-3">
            <span className="text-xs text-gray-500">Report #{report.id}</span>
          </div>

          {/* Description */}
          <p className="text-gray-900 font-medium mb-4">{report.description}</p>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span>{report.user.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-xs">{report.user.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} />
              <span>{report.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>{new Date(report.submitted_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              onClick={handleVerify}
              disabled={isReviewing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check size={18} />
              Verify
            </Button>
            <Button
              onClick={() => setShowRejectModal(true)}
              disabled={isReviewing}
              variant="danger"
              className="flex-1"
            >
              <X size={18} />
              Reject
            </Button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reject Report
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this report:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Invalid photo, wrong category, duplicate submission..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1"
                disabled={isReviewing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                variant="danger"
                className="flex-1"
                disabled={isReviewing || !rejectReason.trim()}
              >
                {isReviewing ? "Rejecting..." : "Reject Report"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportReviewCard;
