import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { FiX, FiSave } from "react-icons/fi";
import { gradeService } from "../../services/gradeService";
import Swal from "sweetalert2";
import { clearGradesCache } from "../../utils/gradesCache";

/**
 * EditGradeModal - Inline modal for editing grade scores.
 * Student, Subject, and Teacher fields are readonly.
 * Only the score field is editable.
 */
const EditGradeModal = ({
  isOpen,
  onClose,
  grade,
  onUpdate,
  studentsMap = new Map(),
  subjectsMap = new Map(),
}) => {
  // OPTIMIZATION: React Query cache management
  // Invalidates cache after update to fetch fresh data
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (grade && isOpen) {
      reset({
        score: grade.score ?? grade.Score ?? 0,
      });
    }
  }, [grade, isOpen, reset]);

  const onSubmit = async (data) => {
    if (!grade) return;

    setLoading(true);
    try {
      // Build EditGradeDTO - all IDs are required, score is updated
      const gradeId = grade.id ?? grade.Id;
      const studentId = grade.studentId ?? grade.StudentId;
      const subjectId = grade.subjectId ?? grade.SubjectId;

      const updateData = {
        studentId,
        subjectId,
        score: parseFloat(data.score),
      };

      const updatedGrade = await gradeService.update(gradeId, updateData);

      // BUG FIX: Clear local cache to prevent stale data on next filter/search
      clearGradesCache();

      // OPTIMIZATION: Invalidate React Query cache to fetch fresh grades data
      // Use predicate to match nested key structure: ["grades", "list", {...}]
      console.log("🔄 Invalidating ALL grades queries after update...");
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "grades" && query.queryKey[1] === "list",
      });
      console.log("✅ Grades cache invalidated - will refetch fresh data");

      // Normalize response to include necessary fields
      const normalizedGrade = {
        ...grade,
        score: updateData.score,
        id: gradeId,
      };

      onUpdate(normalizedGrade);
      onClose();
    } catch (error) {
      // OPTIMIZATION: Comprehensive error handling for network and API errors
      let errorMessage = "Failed to update grade. Please try again.";

      if (!error.response) {
        // Network error, timeout, or other request error
        if (error.code === "ECONNABORTED") {
          errorMessage =
            "Request timeout. Please check your internet connection and try again.";
        } else if (error.message === "Network Error") {
          errorMessage =
            "Network error: Unable to reach the server. Please check your connection.";
        } else {
          errorMessage =
            "Connection error: Please check your internet connection and try again.";
        }
      } else if (error.response?.status === 500) {
        errorMessage =
          "Server error: The update request failed. Please check the data and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data: Please check all fields and try again.";
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        errorMessage =
          "Permission denied: You don't have permission to update this grade.";
      } else if (error.response?.status === 404) {
        errorMessage =
          "Grade not found: The grade may have been deleted. Please refresh the page.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Extract display values using maps for O(1) lookup
  const studentId = grade?.studentId ?? grade?.StudentId;
  const subjectId = grade?.subjectId ?? grade?.SubjectId;

  const studentName =
    studentsMap.get(studentId) ?? // 1. Direct map lookup (O(1))
    grade?.Student?.name ?? // 2. Nested object
    grade?.studentName ?? // 3. Flat field
    `Student ${studentId}`; // 4. Fallback with ID

  const subjectName =
    subjectsMap.get(subjectId) ?? // 1. Direct map lookup (O(1))
    grade?.Subject?.name ?? // 2. Nested object
    grade?.subjectName ?? // 3. Flat field
    `Subject ${subjectId}`; // 4. Fallback with ID

  // 3. Fallback with ID

  return (
    <div className="fixed inset-0 z-[1040] flex items-center justify-center bg-black/50">
      <div
        className="relative rounded-lg bg-[var(--color-background-primary)] w-full max-w-md mx-4"
        style={{
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div
          className="rounded-lg shadow-xl w-full max-w-md mx-4"
          style={{
            backgroundColor: "var(--color-surface-primary)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderBottomColor: "var(--color-border-primary)" }}
          >
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Edit Grade
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md transition-colors"
              style={{
                color: "var(--color-text-secondary)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor =
                  "var(--color-background-tertiary)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
              aria-label="Close edit grade modal"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-4">
              {/* Student Field (readonly) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Student
                </label>
                <input
                  type="text"
                  value={studentName}
                  disabled
                  className="w-full px-3 py-2 border rounded-md focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-primary)",
                    color: "var(--color-text-tertiary)",
                    opacity: 0.8,
                  }}
                />
              </div>

              {/* Subject Field (readonly) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Subject
                </label>
                <input
                  type="text"
                  value={subjectName}
                  disabled
                  className="w-full px-3 py-2 border rounded-md focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-primary)",
                    color: "var(--color-text-tertiary)",
                    opacity: 0.8,
                  }}
                />
              </div>

              {/* Teacher Field (readonly) */}

              {/* Score Field (editable) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Score <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("score", {
                    required: "Score is required",
                    min: {
                      value: 0,
                      message: "Score must be at least 0",
                    },
                    max: {
                      value: 100,
                      message: "Score must be at most 100",
                    },
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    backgroundColor: "var(--color-background-primary)",
                    borderColor: errors.score
                      ? "var(--color-error)"
                      : "var(--color-border-primary)",
                    color: "var(--color-text-primary)",
                    outlineColor: errors.score
                      ? "var(--color-error)"
                      : "var(--color-border-focus)",
                  }}
                  placeholder="Enter score (0-100)"
                />
                {errors.score && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--color-error)" }}
                  >
                    {errors.score.message}
                  </p>
                )}
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Score must be between 0 and 100
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border transition-colors"
                style={{
                  borderColor: "var(--color-border-primary)",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-background-primary)",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor =
                    "var(--color-background-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor =
                    "var(--color-background-primary)")
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-interactive-primary)",
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) =>
                  !loading &&
                  (e.target.style.backgroundColor =
                    "var(--color-interactive-primary-hover)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor =
                    "var(--color-interactive-primary)")
                }
              >
                <FiSave size={16} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGradeModal;
