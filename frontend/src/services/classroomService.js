import api from "./axios";

/**
 * Classrooms API. GET /classrooms returns PagedResponse: { data: ClassroomDTO[], totalCount: number }.
 * Query params: name, page, limit, orderBy, isDescending (ClassroomFilterDTO + BaseFilterDTO).
 */
export const classroomService = {
  getAll: async (params = {}) => {
    const response = await api.get("/classrooms", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/classrooms/${id}`);
    return response.data;
  },

  /**
   * POST /classrooms/{id}/assign-teacher
   * Body: { teacherId: number }
   * Handles duplicate teacher assignments with proper error messages
   * Teachers can only assign themselves to classrooms
   */
  assignTeacher: async (classroomId, teacherId) => {
    try {
      const response = await api.post(
        `/classrooms/${classroomId}/assign-teacher`,
        {
          teacherId: Number(teacherId),
        },
      );
      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error;

        // Check for duplicate assignment error - return as special error type
        if (
          errorMessage?.toLowerCase().includes("already assigned") ||
          errorMessage?.toLowerCase().includes("duplicate") ||
          errorMessage?.toLowerCase().includes("already exists")
        ) {
          const duplicateError = new Error(
            "This teacher is already assigned to this classroom",
          );
          duplicateError.isDuplicateAssignment = true;
          duplicateError.userMessage =
            "This teacher is already assigned to this classroom";
          throw duplicateError;
        }

        // Check for self-assignment restriction
        if (
          errorMessage?.toLowerCase().includes("can only assign yourself") ||
          errorMessage?.toLowerCase().includes("self-assignment") ||
          errorMessage?.toLowerCase().includes("only assign themselves")
        ) {
          const permissionError = new Error(
            "Teachers can only assign themselves to classrooms",
          );
          permissionError.isPermissionError = true;
          permissionError.userMessage =
            "Teachers can only assign themselves to classrooms";
          throw permissionError;
        }

        // Check for teacher not found
        if (
          errorMessage?.toLowerCase().includes("teacher not found") ||
          errorMessage?.toLowerCase().includes("teacher with id")
        ) {
          throw new Error("Teacher not found");
        }

        // Check for classroom not found
        if (
          errorMessage?.toLowerCase().includes("classroom not found") ||
          errorMessage?.toLowerCase().includes("classroom with id")
        ) {
          throw new Error("Classroom not found");
        }

        // Generic bad request error
        throw new Error(errorMessage || "Invalid request");
      }

      // Handle other HTTP errors
      if (error.response?.status === 404) {
        throw new Error("Classroom or teacher not found");
      }

      if (error.response?.status === 409) {
        const duplicateError = new Error(
          "Teacher is already assigned to this classroom",
        );
        duplicateError.isDuplicateAssignment = true;
        duplicateError.userMessage =
          "This teacher is already assigned to this classroom";
        throw duplicateError;
      }

      // Handle 403 Forbidden (permission issues)
      if (error.response?.status === 403) {
        const permissionError = new Error(
          "You can only assign yourself to classrooms",
        );
        permissionError.isPermissionError = true;
        permissionError.userMessage =
          "You can only assign yourself to classrooms";
        throw permissionError;
      }

      // Generic error fallback
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to assign teacher",
      );
    }
  },

  /**
   * GET /classrooms/{id} - Get classroom with teacher assignments
   * Used to check current teacher assignments before assigning new ones
   */
  getClassroomWithTeachers: async (classroomId) => {
    try {
      const response = await api.get(`/classrooms/${classroomId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load classroom details",
      );
    }
  },
};
