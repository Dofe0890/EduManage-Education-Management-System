import api from "./axios";

/**
 * Normalize API response to consistent format.
 * Validates data integrity and handles various response shapes.
 * DEBUG: Logs normalization for troubleshooting
 */
const normalizeResponse = (response) => {
  console.log("📦 SubjectService normalizing response:", response);

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

export const subjectService = {
  // Get all subjects with pagination and filtering
  getAll: async (params = {}) => {
    const response = await api.get("/subjects", { params });
    console.log("🔗 [GET /subjects]", params);
    return normalizeResponse(response.data);
  },

  // Get subject by ID
  getById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    console.log("🔗 [GET /subjects/" + id + "]");
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid subject response - expected object");
    }
    return response.data;
  },
  getByName: async (name) => {
    const response = await api.get(`/subjects/by-name`, name);
    console.log("🔗 [GET /subjects/by-name]");
    return response.data;
  },
};
