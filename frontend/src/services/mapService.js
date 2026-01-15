import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Mock mode for testing (Toggle this to true if backend is down)
const MOCK_MODE = false;

// Mock recycling centers in Nairobi
const mockRecyclingCenters = [
  {
    id: 1,
    name: "EcoWaste Recycling Center",
    type: "recycling_center",
    address: "Industrial Area, Nairobi",
    latitude: -1.3207, // Fixed key to 'latitude' to match backend
    longitude: 36.8647, // Fixed key to 'longitude'
    phone: "0700123456",
    services: ["Plastic", "E-waste", "Paper"],
    rating: 4.5,
    open_hours: "Mon-Sat: 8AM-6PM",
  },
  {
    id: 2,
    name: "GreenCycle Collection Point",
    type: "collection_point",
    address: "Kilimani, Nairobi",
    latitude: -1.2921,
    longitude: 36.7809,
    phone: "0711234567",
    services: ["Plastic", "Paper", "Glass"],
    rating: 4.2,
    open_hours: "Mon-Fri: 9AM-5PM",
  },
  {
    id: 3,
    name: "Kasarani Waste Management",
    type: "recycling_center",
    address: "Kasarani, Nairobi",
    latitude: -1.2195,
    longitude: 36.8987,
    phone: "0722345678",
    services: ["Organic", "E-waste", "Plastic"],
    rating: 4.7,
    open_hours: "Mon-Sat: 7AM-7PM",
  },
];

// Mock user activity locations
const mockUserActivities = [
  {
    id: 1,
    activity_type: "plastic",
    description: "Recycled plastic bottles",
    latitude: -1.2864,
    longitude: 36.8172,
    points_earned: 50,
    created_at: "2025-12-10T10:30:00Z",
  },
  {
    id: 2,
    activity_type: "electronics",
    description: "Disposed old phone",
    latitude: -1.3207,
    longitude: 36.8647,
    points_earned: 100,
    created_at: "2025-12-09T14:20:00Z",
  },
];

// --- Helper Functions ---

// Calculate distance (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 0;

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

// --- Service Methods ---

const getCenters = async (filters = {}) => {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockRecyclingCenters }), 300);
    });
  }

  try {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_BASE_URL}/map/centers/?${params}`);
    return response;
  } catch (error) {
    console.error("Error fetching centers:", error);
    return { data: [] }; // Safety fallback
  }
};

const getNearbyCenters = async (lat, lng, radius = 5000) => {
  if (MOCK_MODE) {
    const centersWithDistance = mockRecyclingCenters.map((center) => {
      const dist = calculateDistance(
        lat,
        lng,
        center.latitude,
        center.longitude
      );
      return { ...center, distance: dist };
    });
    return {
      data: centersWithDistance
        .filter((c) => c.distance * 1000 <= radius) // Convert km to m for comparison
        .sort((a, b) => a.distance - b.distance),
    };
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/map/centers/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching nearby centers:", error);
    return { data: [] };
  }
};

const getUserActivities = async () => {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockUserActivities }), 300);
    });
  }

  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/map/activities/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error fetching activity locations:", error);
    return { data: [] };
  }
};

const createCenter = async (centerData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/map/centers/`,
      centerData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating center:", error);
    throw error;
  }
};

// Helper for icons (Used if component doesn't have its own)
const getActivityIcon = (activityType) => {
  const icons = {
    plastic: "🥤",
    electronics: "📱",
    paper: "📄",
    glass: "🍾",
    metal: "🥫",
  };
  return icons[activityType] || "♻️";
};

const mapService = {
  getCenters, // Replaces getRecyclingCenters
  getNearbyCenters, // Replaces getNearbyCenter (singular)
  getUserActivities, // Replaces getUserActivityLocations
  createCenter,
  calculateDistance,
  formatDistance,
  getActivityIcon,
};

export default mapService;
