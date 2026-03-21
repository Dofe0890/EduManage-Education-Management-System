import api from "./axios";

export const teacherService = {
  // Get all teachers with pagination and filtering
  // Note: Backend endpoint is /teachers/All with Admin role required
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/teachers/All", { params });
      return response.data;
    } catch (error) {
      // If 403/401 due to permissions, provide a helpful error
      if (error.response?.status === 403) {
        throw new Error("Admin access required to view teachers");
      }
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      }
      // For 404 or other errors, provide a fallback
      if (error.response?.status === 404) {
        return { data: [], totalCount: 0 };
      }
      throw error;
    }
  },

  // Get teacher by ID
  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // Get current teacher by user ID
  getByUserId: async () => {
    try {
      // If no userId provided, try to get from stored user data

      const response = await api.get(`/teachers/by-user-id`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new teacher
  create: async (teacherData) => {
    const response = await api.post("/teachers", teacherData);
    return response.data;
  },

  // Update teacher
  update: async (id, teacherData) => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  // Delete teacher
  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  // Get teacher's student count
  getStudentCount: async (teacherId) => {
    try {
      const response = await api.get(`/teachers/${teacherId}/student-count`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist or teacher not found, return default values
      if (error.response?.status === 404) {
        return {
          totalStudents: 0,
          totalClasses: 0,
          teacherName: "Unknown",
          lastUpdated: new Date().toISOString(),
          classBreakdown: [],
        };
      }
      throw error;
    }
  },
  // Get dashboard metrics scoped to authenticated teacher
  getDashboardMetrics: async (params = {}) => {
    try {
      const response = await api.get(`/teachers/me/dashboard/metrics`, {
        params,
      });
      console.log("Dashboard Metrics Response:", response.data);
      return response.data;
    } catch (err) {
      // Return a plain object error instead of throwing Error
      return Promise.reject({
        status: err?.response?.status ?? 500,
        message: err?.message ?? "Failed to fetch dashboard metrics",
        data: err?.response?.data ?? null,
      });
    }
  },
};
