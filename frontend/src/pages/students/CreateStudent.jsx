import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentContext } from "../../contexts/StudentContext";
import { studentService } from "../../services/studentService";
import {
  FaUserPlus,
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaBook,
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

const CreateStudent = () => {
  const navigate = useNavigate();
  const { addStudent } = useStudentContext();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    classroomId: 0,
    status: 1,
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
        status: true,
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 group"
            title="Back to Students"
          >
            <FaArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
          </button>
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Add New Student
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Fill in the details to enroll a new student in the system.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div
        className="rounded-2xl shadow-xl border overflow-hidden backdrop-blur-sm"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          borderColor: "var(--color-border-primary)",
        }}
      >
        <div
          className="h-2 w-full"
          style={{ backgroundColor: "var(--color-interactive-primary)" }}
        />

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {errors.submit && (
            <div
              className="p-4 border-l-4 rounded-r-lg flex items-center gap-3 animate-shake"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderColor: "var(--color-error)",
              }}
            >
              <div className="p-1 rounded-full bg-red-500 text-white">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-error)" }}
              >
                {errors.submit}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <FaUser className="w-4 h-4 text-blue-500" />
                Full Name <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 ${
                    errors.name
                      ? "border-red-500 bg-red-50/10"
                      : "group-hover:border-blue-400"
                  }`}
                  style={{
                    borderColor: errors.name
                      ? "var(--color-error)"
                      : "var(--color-border-primary)",
                    backgroundColor: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="e.g. John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p
                  className="text-xs font-medium animate-in slide-in-from-top-1"
                  style={{ color: "var(--color-error)" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Age Field */}
            <div className="space-y-2">
              <label
                htmlFor="age"
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <FaCalendarAlt className="w-4 h-4 text-green-500" />
                Age <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 ${
                    errors.age
                      ? "border-red-500 bg-red-50/10"
                      : "group-hover:border-blue-400"
                  }`}
                  style={{
                    borderColor: errors.age
                      ? "var(--color-error)"
                      : "var(--color-border-primary)",
                    backgroundColor: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="Enter age"
                  disabled={isLoading}
                />
              </div>
              {errors.age && (
                <p
                  className="text-xs font-medium animate-in slide-in-from-top-1"
                  style={{ color: "var(--color-error)" }}
                >
                  {errors.age}
                </p>
              )}
            </div>

            {/* Classroom Field */}
            <div className="space-y-2">
              <label
                htmlFor="classroomId"
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <FaBook className="w-4 h-4 text-purple-500" />
                Classroom ID <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  id="classroomId"
                  name="classroomId"
                  value={formData.classroomId}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 ${
                    errors.classroomId
                      ? "border-red-500 bg-red-50/10"
                      : "group-hover:border-blue-400"
                  }`}
                  style={{
                    borderColor: errors.classroomId
                      ? "var(--color-error)"
                      : "var(--color-border-primary)",
                    backgroundColor: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="Assign to classroom"
                  disabled={isLoading}
                />
              </div>
              {errors.classroomId && (
                <p
                  className="text-xs font-medium animate-in slide-in-from-top-1"
                  style={{ color: "var(--color-error)" }}
                >
                  {errors.classroomId}
                </p>
              )}
            </div>

            {/* Note Section */}
            <div className="md:col-span-1 flex items-end">
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 w-full">
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  New students are automatically set as <strong>Active</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex items-center justify-end gap-4 pt-8 border-t"
            style={{ borderTopColor: "var(--color-border-primary)" }}
          >
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-xl font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{
                color: "var(--color-text-secondary)",
                backgroundColor: "var(--color-background-secondary)",
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
              style={{ backgroundColor: "var(--color-interactive-primary)" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <ImSpinner2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaUserPlus className="w-5 h-5" />
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudent;
