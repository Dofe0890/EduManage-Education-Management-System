import api from "./axios";

export const subjectService = {
  // Get all subjects with pagination and filtering
  getAll: async (params = {}) => {
    const response = await api.get("/subjects", { params });
    return response.data;
  },

  // Get subject by ID
  getById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },
  getByName: async (name) => {
    const response = await api.get(`/subjects/by-name`, name);
    return response.data;
  },
};
