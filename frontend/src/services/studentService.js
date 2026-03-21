import api from "./axios";

/**
 * Normalize API response to consistent format.
 * Validates data integrity and handles various response shapes.
 * DEBUG: Logs normalization for troubleshooting
 */
const normalizeResponse = (response) => {
  console.log("📦 StudentService normalizing response:", response);

  if (Array.isArray(response)) {
    console.log("   ✅ Response is array with", response.length, "items");
    return { data: response, totalCount: response.length };
  }

  // Extract data array from response
  const data = response?.data ?? response?.items ?? [];

  // Validate data is actually an array
  if (!Array.isArray(data)) {
    console.warn("   ⚠️  Response data is not an array. Expected data or items array.", response);
    return { data: [], totalCount: 0 };
  }

  // Extract total count from various possible field names
  const totalCount = response?.totalCount ?? response?.total ?? response?.count ?? 0;

  console.log("   ✅ Normalized:", data.length, "items,", totalCount, "total");
  return { data, totalCount };
};

/**
 * Students API. GET /students returns PagedResponse: { data: StudentDTO[], totalCount: number }.
 * Query params: name, age, classroomId, status, page, limit, orderBy, isDescending (StudentFilterDTO + BaseFilterDTO).
 */
export const studentService = {
  getAll: async (params = {}) => {
    const response = await api.get("/students", { params });
    console.log("🔗 [GET /students]", params);
    return normalizeResponse(response.data);
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
