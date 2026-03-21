import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiX, FiSave } from "react-icons/fi";
import { studentService } from "../../services/studentService";
import Swal from "sweetalert2";

const EditStudentModal = ({ isOpen, onClose, student, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Check if student is inactive
  const isInactive = student?.status === false;

  useEffect(() => {
    if (student && isOpen) {
      reset({
        name: student.name,
        age: student.age,
        classroomId: student.classroomId,
      });
    }
  }, [student, isOpen, reset]);

  const onSubmit = async (data) => {
    if (!student) return;

    // Prevent editing inactive students
    if (isInactive) {
      Swal.fire({
        title: "Access Denied!",
        text: "Cannot edit inactive students. Please activate the student first.",
        icon: "warning",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setLoading(true);
    try {
      // Ensure data is in correct format
      const updateData = {
        name: data.name?.trim(),
        age: parseInt(data.age),
        classroomId: parseInt(data.classroomId),
      };

      const updatedStudent = await studentService.update(
        student.id,
        updateData,
      );
      onUpdate(updatedStudent);
      onClose();
    } catch (error) {
      let errorMessage = "Failed to update student. Please try again.";

      if (error.response?.status === 500) {
        errorMessage =
          "Server error: The update request failed. Please check the data and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data: Please check all fields and try again.";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg shadow-xl w-full max-w-md mx-4 bg-[var(--color-background-primary)]">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderBottomColor: "var(--color-border-primary)" }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Edit Student
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor =
                "var(--color-background-tertiary)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Inactive Student Warning */}
        {isInactive && (
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: "#fef2f2",
              borderColor: "#ef4444",
            }}
          >
            <p className="text-sm" style={{ color: "#ef4444" }}>
              <strong>Warning:</strong> This student is inactive and cannot be
              edited. Please activate the student first to make changes.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Student Name
              </label>
              <input
                type="text"
                {...register("name", {
                  required: "Student name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                style={{
                  borderColor: "var(--color-border-primary)",
                  color: "var(--color-text-primary)",
                  backgroundColor: isInactive
                    ? "var(--color-background-secondary)"
                    : "var(--color-background-primary)",
                  opacity: isInactive ? 0.6 : 1,
                }}
                placeholder="Enter student name"
                disabled={isInactive}
              />
              {errors.name && (
                <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Age Field */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Age
              </label>
              <input
                type="number"
                {...register("age", {
                  required: "Age is required",
                  min: {
                    value: 6,
                    message: "Age must be at least 6",
                  },
                  max: {
                    value: 100,
                    message: "Age must be less than 100",
                  },
                })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                style={{
                  borderColor: "var(--color-border-primary)",
                  color: "var(--color-text-primary)",
                  backgroundColor: isInactive
                    ? "var(--color-background-secondary)"
                    : "var(--color-background-primary)",
                  opacity: isInactive ? 0.6 : 1,
                }}
                placeholder="Enter age"
                disabled={isInactive}
              />
              {errors.age && (
                <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                  {errors.age.message}
                </p>
              )}
            </div>

            {/* Classroom Field */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Classroom
              </label>
              <input
                type="number"
                {...register("classroomId", {
                  required: "Classroom is required",
                  min: {
                    value: 1,
                    message: "Classroom ID must be a positive number",
                  },
                })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                style={{
                  borderColor: "var(--color-border-primary)",
                  color: "var(--color-text-primary)",
                  backgroundColor: isInactive
                    ? "var(--color-background-secondary)"
                    : "var(--color-background-primary)",
                  opacity: isInactive ? 0.6 : 1,
                }}
                placeholder="Enter classroom ID"
                disabled={isInactive}
              />
              {errors.classroomId && (
                <p className="mt-1 text-sm" style={{ color: "#ef4444" }}>
                  {errors.classroomId.message}
                </p>
              )}
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
                backgroundColor: "transparent",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isInactive}
              className="px-4 py-2 rounded-md text-white flex items-center gap-2 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: isInactive
                  ? "var(--color-background-secondary)"
                  : "var(--color-interactive-primary)",
              }}
            >
              <FiSave size={16} />
              {isInactive
                ? "Student Inactive"
                : loading
                  ? "Saving..."
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
