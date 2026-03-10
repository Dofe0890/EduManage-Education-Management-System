import React, { useState, useEffect } from "react";
import {
  FiUserPlus,
  FiAlertCircle,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";
import Modal from "../common/Modal";
import { useAssignTeacher } from "../../hooks/useClassrooms";
import { useAuth } from "../../hooks/useAuth";
import { classroomService } from "../../services/classroomService";

/**
 * Modal to assign a teacher to a classroom. POST /classrooms/{id}/assign-teacher
 * Teachers can only assign themselves to classrooms
 * Uses auth context for teacher info to avoid unnecessary API calls
 * Fetches classroom details to check assignment status
 * Handles duplicate assignments and provides user-friendly error messages
 */
export default function AssignClassModal({
  isOpen,
  onClose,
  classroom,
  onSuccess,
}) {
  const [error, setError] = useState(null);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [classroomDetails, setClassroomDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const assignTeacherMutation = useAssignTeacher();
  const { user, isAuthenticated, teacherId } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setClassroomDetails(null);

    // Get current teacher info from auth context (no API request needed)
    const getTeacherFromAuth = () => {
      try {
        if (user && teacherId) {
          setCurrentTeacher({
            id: teacherId,
            fullName: user.fullName || user.name || `Teacher ${teacherId}`,
            name: user.name || `Teacher ${teacherId}`,
            email: user.email,
          });
        } else {
          setError("Teacher information not found");
        }
      } catch (err) {
        setError("Unable to get teacher information");
      }
    };

    // Fetch classroom details to get current teacher assignments
    const fetchDetails = async () => {
      if (classroom?.id) {
        setIsLoadingDetails(true);
        try {
          const details = await classroomService.getClassroomWithTeachers(
            classroom.id,
          );
          setClassroomDetails(details);
        } catch (err) {
          // Don't set error for classroom fetch, just log it
          // The modal can still function without this data
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };

    if (isAuthenticated) {
      getTeacherFromAuth();
      fetchDetails();
    } else {
      setError("Authentication required");
    }
  }, [isOpen, isAuthenticated, classroom?.id, user, teacherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classroom?.id || !currentTeacher?.id) return;

    setError(null);

    try {
      await assignTeacherMutation.mutateAsync({
        classroomId: classroom.id,
        teacherId: currentTeacher.id,
      });

      // Success will be handled by the hook's toast
      onSuccess?.();
      onClose();
    } catch (err) {
      // Only set error state for non-handled errors (authentication, network, etc.)
      if (!err.isDuplicateAssignment && !err.isPermissionError) {
        setError(err.message);
      }
      // For duplicate/permission errors, the hook handles toast display
    }
  };

  // Check if current teacher is already assigned to this classroom
  const isAlreadyAssigned = classroomDetails?.teachers?.some(
    (teacher) => teacher.id === currentTeacher?.id,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign to ${classroom?.name || "class"}`}
      size="md"
    >
      {classroom && (
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Assign to <strong>{classroom.name}</strong>
          {isLoadingDetails && (
            <span
              className="ml-2 text-xs"
              style={{ color: "var(--color-info)" }}
            >
              Loading classroom details...
            </span>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="rounded-lg border px-3 py-2 text-sm flex items-start gap-2"
            style={{
              backgroundColor:
                error.includes("already assigned") ||
                error.includes("can only assign")
                  ? "var(--color-warning-light)"
                  : "var(--color-error-light)",
              borderColor:
                error.includes("already assigned") ||
                error.includes("can only assign")
                  ? "var(--color-warning)"
                  : "var(--color-error)",
              color:
                error.includes("already assigned") ||
                error.includes("can only assign")
                  ? "var(--color-warning)"
                  : "var(--color-error)",
            }}
          >
            <FiAlertCircle className="mt-0.5 flex-shrink-0" size={14} />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            Teacher
          </label>
          <div
            className="w-full px-3 py-2 border rounded-lg"
            style={{
              borderColor: "var(--color-border-primary)",
              backgroundColor: "var(--color-background-secondary)",
            }}
          >
            {currentTeacher ? (
              <div className="flex items-center gap-3">
                <FiUser
                  className="flex-shrink-0"
                  size={16}
                  style={{ color: "var(--color-text-tertiary)" }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {currentTeacher.fullName || currentTeacher.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Current User
                  </p>
                </div>
              </div>
            ) : (
              <p
                className="text-sm"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                No teacher information available
              </p>
            )}
          </div>

          {isAlreadyAssigned && (
            <div
              className="mt-2 flex items-center gap-2 text-xs"
              style={{ color: "var(--color-warning)" }}
            >
              <FiCheckCircle size={12} />
              <span>You are already assigned to this classroom</span>
            </div>
          )}
        </div>

        {/* Show current teachers assigned to this classroom */}
        {classroomDetails?.teachers && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Assigned Teachers at Class ({classroomDetails.teachers.length})
            </label>
            {classroomDetails.teachers.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {classroomDetails.teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor:
                        teacher.id === currentTeacher?.id
                          ? "var(--color-warning-light)"
                          : "var(--color-background-secondary)",
                      borderColor:
                        teacher.id === currentTeacher?.id
                          ? "var(--color-warning)"
                          : "var(--color-border-primary)",
                    }}
                  >
                    <FiUser
                      className="flex-shrink-0"
                      size={14}
                      style={{
                        color:
                          teacher.id === currentTeacher?.id
                            ? "var(--color-warning)"
                            : "var(--color-text-tertiary)",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{
                          color:
                            teacher.id === currentTeacher?.id
                              ? "var(--color-warning)"
                              : "var(--color-text-primary)",
                        }}
                      >
                        {teacher.name}
                      </p>
                      {teacher.email && (
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {teacher.email}
                        </p>
                      )}
                    </div>
                    {teacher.id === currentTeacher?.id && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--color-warning)" }}
                      >
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-sm italic"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                No teachers assigned to this classroom yet
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={assignTeacherMutation.isPending}
            className="px-3 py-2 text-sm rounded-lg disabled:opacity-50 transition-colors"
            style={{
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-background-secondary)",
            }}
            onMouseEnter={(e) => {
              if (!assignTeacherMutation.isPending) {
                e.target.style.backgroundColor =
                  "var(--color-background-tertiary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!assignTeacherMutation.isPending) {
                e.target.style.backgroundColor =
                  "var(--color-background-secondary)";
              }
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              !currentTeacher?.id ||
              assignTeacherMutation.isPending ||
              isAlreadyAssigned
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--color-interactive-primary)" }}
          >
            <FiUserPlus size={16} />
            {assignTeacherMutation.isPending ? "Assigning..." : "Assign"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
