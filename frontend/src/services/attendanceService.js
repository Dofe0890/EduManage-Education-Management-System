import api from "./axios";

/**
 * Normalizes API response to consistent format.
 * Handles various response shapes from backend.
 */
const normalizeResponse = (response) => {
  if (!response) return { data: [], totalCount: 0 };

  // If response is already an array
  if (Array.isArray(response)) {
    return { data: response, totalCount: response.length };
  }

  // If response has data/items property
  const data = response.data ?? response.items ?? response.records ?? [];
  const totalCount =
    response.totalCount ?? response.total ?? response.count ?? data.length;

  return { data, totalCount };
};

export const attendanceService = {
  // Get all attendance records with pagination and filtering
  getAll: async (params = {}) => {
    const response = await api.get("/attendance", { params });
    return normalizeResponse(response.data);
  },

  // Get attendance by ID
  getById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  // Create attendance record
  create: async (attendanceData) => {
    const response = await api.post("/attendance", attendanceData);
    return response.data;
  },

  // Update attendance record
  update: async (id, attendanceData) => {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },

  // Delete attendance record
  delete: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },

  // Get attendance by student
  getByStudent: async (studentId, params = {}) => {
    const response = await api.get(`/attendance/student/${studentId}`, {
      params,
    });
    return normalizeResponse(response.data);
  },

  // Bulk update attendance records (for marking multiple students at once)
  bulkUpdate: async (attendanceRecords) => {
    const response = await api.post("/attendance/bulk", attendanceRecords);
    return response.data;
  },

  // Get attendance by classroom
  getByClassroom: async (classroomId, params = {}) => {
    const response = await api.get(`/attendance/classroom/${classroomId}`, {
      params,
    });
    return normalizeResponse(response.data);
  },

  // Get attendance by date
  getByDate: async (date, params = {}) => {
    const response = await api.get(`/attendance/date/${date}`, {
      params,
    });
    return normalizeResponse(response.data);
  },
};
