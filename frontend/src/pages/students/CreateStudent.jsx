import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentContext } from "../../contexts/StudentContext";
import { studentService } from "../../services/studentService";

const CreateStudent = () => {
  const navigate = useNavigate();
  const { addStudent } = useStudentContext();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    classroomId: 0,
    status: 1, // Active by default
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.age || formData.age < 6) {
      newErrors.age = "Age must be at least 6";
    }

    if (!formData.classroomId || formData.classroomId < 1) {
      newErrors.classroomId = "Valid classroom ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Convert form data to proper types
      const submissionData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        classroomId: parseInt(formData.classroomId),
        status: Boolean(parseInt(formData.status)),
      };

      const newStudent = await studentService.create(submissionData);
      addStudent(newStudent);
      navigate("/app/students");
    } catch (error) {
      setErrors({ submit: "Failed to create student. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/app/students");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Create Student
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Add a new student to the system
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div
        className="rounded-2xl shadow-sm border p-6"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          borderColor: "var(--color-border-primary)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div
              className="p-4 border rounded-lg"
              style={{
                backgroundColor: "var(--color-error-light)",
                borderColor: "var(--color-error)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--color-error)" }}>
                {errors.submit}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{
                  borderColor: "var(--color-border-primary)",
                  backgroundColor: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                }}
                placeholder="Enter student's full name"
                disabled={isLoading}
              />
              {errors.name && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--color-error)" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Age Field */}
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{
                  borderColor: "var(--color-border-primary)",
                  backgroundColor: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                }}
                placeholder="Enter age"
                disabled={isLoading}
              />
              {errors.age && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--color-error)" }}
                >
                  {errors.age}
                </p>
              )}
            </div>

            {/* Classroom Field */}
            <div>
              <label
                htmlFor="classroomId"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Classroom Id
              </label>
              <input
                type="number"
                id="classroomId"
                name="classroomId"
                value={formData.classroomId}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{
                  borderColor: "var(--color-border-primary)",
                  backgroundColor: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                }}
                placeholder="Classroom ID"
                disabled={isLoading}
              />
              {errors.classroomId && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--color-error)" }}
                >
                  {errors.classroomId}
                </p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{
                  borderColor: "var(--color-border-primary)",
                  backgroundColor: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                }}
                disabled={isLoading}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex items-center justify-end gap-4 pt-6 border-t"
            style={{ borderTopColor: "var(--color-border-primary)" }}
          >
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                color: "var(--color-text-secondary)",
                backgroundColor: "var(--color-background-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor =
                    "var(--color-background-tertiary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor =
                    "var(--color-background-secondary)";
                }
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "var(--color-interactive-primary)" }}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudent;
