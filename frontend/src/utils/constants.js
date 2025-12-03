export const APP_NAME = import.meta.env.VITE_APP_NAME;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  MAP: "/map",
  EDUCATION: "/education",
  PROFILE: "/profile",
  ADMIN: "/admin",
};

export const BADGE_TYPES = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
};

export const POINT_VALUES = {
  RECYCLE_REPORT: 10,
  PROPER_DISPOSAL: 5,
  EDUCATION_COMPLETE: 15,
};
