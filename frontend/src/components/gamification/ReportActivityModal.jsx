import { useState } from "react";
import { X, Upload, MapPin, Calendar, Sparkles } from "lucide-react";
import { Button } from "../common/Button";
import gamificationService from "../../services/gamificationService";
import toast from "react-hot-toast";

const ReportActivityModal = ({ isOpen, onClose, onActivityReported }) => {
  const [formData, setFormData] = useState({
    activity_type: "",
    description: "",
    location: "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityTypes = gamificationService.getActivityTypes();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.activity_type) {
      toast.error("Please select an activity type");
      return;
    }

    setIsSubmitting(true);

    try {
      const activityType = activityTypes.find(
        (t) => t.type === formData.activity_type
      );
      const result = await gamificationService.reportActivity(formData);

      toast.success(`Great! You earned ${activityType.points} points! 🎉`);

      if (onActivityReported) {
        onActivityReported(result);
      }

      // Reset form
      setFormData({
        activity_type: "",
        description: "",
        location: "",
        image: null,
      });
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      toast.error("Failed to report activity. Please try again.");
      console.error("Error reporting activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Report Activity</h2>
              <p className="text-sm text-primary-100">
                Log your recycling action and earn points!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Activity Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activityTypes.map((type) => (
                <button
                  key={type.type}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      activity_type: type.type,
                    }))
                  }
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.activity_type === type.type
                      ? "border-primary-500 bg-primary-50 shadow-md"
                      : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{type.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {type.label}
                        </h3>
                        <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                          +{type.points} pts
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell us about your recycling activity..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="inline mr-1" size={16} />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Where did you recycle? (e.g., Home, Kasarani Market)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Upload className="inline mr-1" size={16} />
              Upload Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: null }));
                      setPreviewUrl(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="text-gray-400 mb-2" size={32} />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !formData.activity_type}
            >
              {isSubmitting ? "Submitting..." : "Submit & Earn Points"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportActivityModal;
