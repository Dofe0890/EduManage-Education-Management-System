import api from "./axios";

/**
 * Students API. GET /students returns PagedResponse: { data: StudentDTO[], totalCount: number }.
 * Query params: name, age, classroomId, status, page, limit, orderBy, isDescending (StudentFilterDTO + BaseFilterDTO).
 */
export const studentService = {
  getAll: async (params = {}) => {
    const response = await api.get("/students", { params });
    return response.data;
  },

  getActive: async () => {
    const response = await api.get("/students/active");
    return response.data;
  },

  getByStatus: async (status) => {
    const response = await api.get(`/students/status/${status}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/students", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/students/${id}`);
  },

  softDelete: async (id) => {
    const response = await api.patch(`/students/${id}/soft-delete`);
    return response.data;
  },
};
