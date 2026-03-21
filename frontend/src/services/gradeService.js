import api from "./axios";

/**
 * Normalizes API response to consistent format.
 * Validates data integrity and handles various response shapes.
 * OPTIMIZATION: Validates array items contain required id field.
 */
const normalizeResponse = (response) => {
  if (Array.isArray(response)) {
    // OPTIMIZATION: Validate all items have required id field
    if (response.length > 0 && !response.every((item) => item.id)) {
      console.warn(
        "API returned grades without id field - this may cause issues",
        response,
      );
    }
    return { data: response, totalCount: response.length };
  }

  // Extract data array from response
  const data = response?.data ?? response?.items ?? [];

  // OPTIMIZATION: Validate data is actually an array
  if (!Array.isArray(data)) {
    console.error(
      "Response data is not an array. Expected data or items array.",
      response,
    );
    return { data: [], totalCount: 0 };
  }

  // Extract total count from various possible field names
  const totalCount =
    response?.totalCount ?? response?.total ?? response?.count ?? 0;

  // OPTIMIZATION: Validate totalCount is a number
  if (typeof totalCount !== "number") {
    console.warn(
      `totalCount is not a number (received: ${typeof totalCount}). Using array length.`,
      response,
    );
    return { data, totalCount: data.length };
  }

  return { data, totalCount };
};

export const gradeService = {
  // Get all grades with pagination and filtering
  // Filter params: studentId, subjectId, teacherId, minScore, maxScore, dateGrade, dateFilterType
  // Pagination params: page, limit, orderBy, isDescending
  // OPTIMIZATION: Supports AbortController signal for request cancellation
  getAll: async (params = {}, config = {}) => {
    const response = await api.get("/grades", { params, ...config });
    return normalizeResponse(response.data);
  },

  // Get grade by ID (returns GradeWithDetailsDTO with Student, Subject, Teacher objects)
  // OPTIMIZATION: Supports AbortController signal for request cancellation
  getById: async (id, config = {}) => {
    const response = await api.get(`/grades/${id}`, config);
    // Validate response contains required fields
    const data = response.data;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid grade response - expected object");
    }
    return data;
  },

  // Create new grade
  create: async (gradeData) => {
    if (!gradeData || typeof gradeData !== "object") {
      throw new Error("Invalid grade data - expected object");
    }
    const response = await api.post("/grades", gradeData);
    // Validate response contains id (required for context operations)
    if (!response.data?.id) {
      console.warn("Created grade response missing id field", response.data);
    }
    return response.data;
  },

  // Update grade (uses EditGradeDTO)
  update: async (id, gradeData) => {
    if (!gradeData || typeof gradeData !== "object") {
      throw new Error("Invalid grade data - expected object");
    }
    const response = await api.put(`/grades/${id}`, gradeData);
    return response.data;
  },

  // Delete grade
  delete: async (id) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },
};
