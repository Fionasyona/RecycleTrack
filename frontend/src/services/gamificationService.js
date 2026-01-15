import api from "./api";

// 1. Define Activity Types (Static Helper)
const ACTIVITY_TYPES = [
  {
    type: "plastic_recycling",
    label: "Plastic Recycling",
    icon: "♻️",
    points: 10,
    description: "Recycle plastic bottles, containers, or bags",
  },
  {
    type: "paper_recycling",
    label: "Paper Recycling",
    icon: "📄",
    points: 5,
    description: "Recycle newspapers, cardboard, or office paper",
  },
  {
    type: "e_waste",
    label: "E-Waste",
    icon: "📱",
    points: 50,
    description: "Recycle old phones, batteries, or cables",
  },
  {
    type: "organic_composting",
    label: "Organic Composting",
    icon: "🌱",
    points: 15,
    description: "Compost food scraps or garden waste",
  },
];

const getUserPoints = async () => {
  try {
    // Backend: gamification/urls.py -> path('stats/', views.get_user_stats)
    const response = await api.get("/gamification/stats/");
    return response;
  } catch (error) {
    console.error("Error fetching user points:", error);
    throw error;
  }
};

const getUserBadges = async () => {
  try {
    // --- FIXED URL ---
    // Old: /gamification/badges/ (404)
    // New: /badges/my-badges/ (This matches your new badges app)
    const response = await api.get("/badges/my-badges/");

    // API returns { earned: [], available: [] }
    const earned = response.earned.map((b) => ({ ...b, unlocked: true }));
    const available = response.available.map((b) => ({
      ...b,
      unlocked: false,
    }));
    return [...earned, ...available];
  } catch (error) {
    console.error("Error fetching badges:", error);
    return [];
  }
};

const getLeaderboard = async (limit = 10) => {
  try {
    // Backend: gamification/urls.py -> path('leaderboard/', views.get_leaderboard)
    const response = await api.get(`/gamification/leaderboard/?limit=${limit}`);
    return response;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

const getRecentActivities = async (limit = 5) => {
  try {
    // --- FIXED URL ---
    // Use the custom endpoint that handles the 'limit' parameter
    // Backend: gamification/urls.py -> path('my-activities/', views.get_user_activities)
    const response = await api.get(
      `/gamification/my-activities/?limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};

const reportActivity = async (activityData) => {
  try {
    // --- FIXED URL ---
    // Backend: gamification/urls.py -> path('report-activity/', views.report_activity)
    const response = await api.post("/gamification/report-activity/", {
      activity_type: activityData.activity_type,
      description: activityData.description,
      location: activityData.location,
      quantity: "1 unit",
      category: "general",
    });
    return response;
  } catch (error) {
    console.error("Error reporting activity:", error);
    throw error;
  }
};

const getActivityTypes = () => {
  return ACTIVITY_TYPES;
};

const gamificationService = {
  getUserPoints,
  getUserBadges,
  getLeaderboard,
  getRecentActivities,
  reportActivity,
  getActivityTypes,
};

export default gamificationService;
