import axios from "axios";
import { toast } from "react-toastify";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: "/api",
  timeout: 10000, // Increased to 10 seconds for real backend connection
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorUrl = error?.config?.url ?? "unknown";
    const errorMessage = String(error?.message ?? "Unknown error");
    const isTimeout =
      (errorMessage && errorMessage.includes("timeout")) ||
      error?.code === "ECONNABORTED";
    const isNetworkError =
      !error?.response &&
      (error?.code === "NETWORK_ERROR" || error?.code === "ECONNREFUSED");

    const safeSummary = {
      status: error?.response?.status ?? null,
      url: String(errorUrl),
      message: errorMessage,
      data: error?.response?.data ?? null,
    };

    // attach safe summary for callers to inspect without triggering DevTools hook errors
    try {
      error.safe = safeSummary;
    } catch (attachErr) {}

    const status = error?.response?.status;
    const data = error?.response?.data;

    if (error?.response) {
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          // Only redirect if this is not a login attempt
          if (!error.config?.url?.includes("/auth/login")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("teacherId");
            toast.error("Session expired. Please login again.");
            window.location.href = "/login";
          }
          break;
        case 403:
          // Forbidden - insufficient permissions
          toast.error(
            "Access denied. You do not have permission to perform this action.",
          );
          break;
        case 404:
          // Not found
          toast.error("Resource not found.");
          break;
        case 422:
          // Validation error
          const validationErrors =
            data?.errors || data?.message || "Validation failed";
          if (Array.isArray(validationErrors)) {
            validationErrors.forEach((err) => toast.error(err));
          } else {
            toast.error(validationErrors);
          }
          break;
        case 500:
          // Server error
          toast.error("Server error. Please try again later.");
          break;
        default:
          // Other errors
          const defaultMessage =
            data?.message || data?.title || "An error occurred";
          toast.error(String(defaultMessage));
      }
    } else if (isTimeout || isNetworkError) {
      // Network error, timeout, or backend not running
      toast.error("Unable to connect to server. Please check your connection.");
    } else {
      // Other errors - don't show toast for auth errors (handled by auth service)
      if (!error.config?.url?.includes("/auth/")) {
        toast.error("An unexpected error occurred.");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
