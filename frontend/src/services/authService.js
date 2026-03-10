import api from "./axios";
import { toast } from "react-toastify";

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      // Handle different response structures
      let authData = response.data;

      // If backend returns user directly (not nested), normalize the structure
      if (
        response.data &&
        !response.data.user &&
        (response.data.id || response.data.email)
      ) {
        authData = {
          token: response.data.token || "default-token",
          user: response.data,
        };
      }

      return authData;
    } catch (error) {
      // Don't log here - let useAuth handle the logging
      // Re-throw the error for the UI to handle
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      // Mock registration for development
      if (error.code === "NETWORK_ERROR" || error.code === "ECONNREFUSED") {
        return {
          message: "Registration successful! Please login.",
          user: {
            id: Math.floor(Math.random() * 1000),
            email: userData.email,
            name: userData.name || userData.email.split("@")[0],
          },
        };
      }
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/revoke");
    } catch (error) {
      toast.info("Logged out");
    } finally {
      // Always clear local storage regardless of API call success
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("teacherId");
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user from server
  getCurrentUser: async () => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  // forgotPassword: async (email) => {
  //   try {
  //     const response = await api.post("/auth/forgot-password", { email });
  //     return response.data;
  //   } catch (error) {
  //     // Mock forgot password for development
  //     if (error.code === "NETWORK_ERROR" || error.code === "ECONNREFUSED") {
  //       return { message: "Password reset email sent (mock)" };
  //     }
  //     throw error;
  //   }
  // },

  // Reset password
  // resetPassword: async (token, newPassword) => {
  //   try {
  //     const response = await api.post("/auth/reset-password", {
  //       token,
  //       newPassword,
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // For real JWT tokens, you'd decode and check expiration
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Store user data and token
  storeAuthData: (token, user) => {
    if (!user) {
      throw new Error("User data is required for storing authentication");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("teacherId");
  },
};
