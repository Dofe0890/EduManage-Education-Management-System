import { useCallback } from "react";
import { useTableData } from "./useTableData";
import { gradeService } from "../services/gradeService";
import { queryKeys } from "../config/queryClient";

/**
 * Custom hook for grade data with subject-centric filtering.
 * Wraps useTableData with grade-specific configuration.
 *
 * @param {Object} options
 * @param {number} [options.teacherId] - Filter by teacher ID (for teacher-only views)
 * @param {number} [options.subjectId] - Filter by subject ID
 * @param {number} [options.studentId] - Filter by student ID
 * @param {Function} [options.onSuccess] - Callback on successful fetch
 * @param {boolean} [options.enabled=true] - Whether fetching is enabled
 */
export function useGrades({
  teacherId,
  subjectId,
  studentId,
  onSuccess,
  enabled = true,
} = {}) {
  /**
   * Fetch grades with optional pre-filtering.
   * Adds teacher/subject/student filters to params if provided.
   */
  const fetchGrades = useCallback(
    async (params) => {
      const obj = Object.fromEntries(params.entries());

      // Add pre-configured filters
      if (teacherId) obj.teacherId = teacherId;
      if (subjectId) obj.subjectId = subjectId;
      if (studentId) obj.studentId = studentId;

      const result = await gradeService.getAll(obj);
      return result;
    },
    [teacherId, subjectId, studentId]
  );

  const table = useTableData({
    fetchData: fetchGrades,
    queryKeyPrefix: queryKeys.gradesListPrefix,
    initialPage: 1,
    initialLimit: 10,
    initialOrderBy: "",
    initialIsDescending: false,
    onSuccess,
    enabled,
  });

  return table;
}

export default useGrades;
