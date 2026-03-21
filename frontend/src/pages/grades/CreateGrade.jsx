import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.jsx";
import { FiSave, FiX, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { gradeService } from "../../services/gradeService";
import { studentService } from "../../services/studentService";
import { subjectService } from "../../services/subjectService";
import { teacherService } from "../../services/teacherService";
import { useGradeData } from "../../contexts/GradeContext";
import { clearGradesCache } from "../../utils/gradesCache";

/**
 * CreateGrade page - Form for creating new grades.
 * Fetches students, subjects, and teachers on mount.
 * Auto-fills teacher from auth context if available.
 */
const CreateGrade = () => {
  const navigate = useNavigate();
  const { addGrade } = useGradeData();
  const { user, isUser, isAdmin } = useAuth();

  // Check if user has permission to create grades
  // Usually both Admin and User (Teacher) can create grades
  const canCreate = isAdmin() || isUser();

  // OPTIMIZATION: React Query cache management
  // Invalidates cache after create to fetch fresh data
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [teacherSubjectId, setTeacherSubjectId] = useState(null);
  const [teacherSubjectName, setTeacherSubjectName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      studentId: "",
      subjectId: "",
      teacherId: "",
      score: "",
    },
  });

  // Fetch dropdown data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);

        // Fetch students and subjects in parallel
        const [studentsRes, subjectsRes] = await Promise.all([
          studentService.getAll({ limit: 1000 }),
          subjectService.getAll({ limit: 1000 }),
        ]);

        // Normalize responses
        const studentsData = studentsRes?.data ?? studentsRes ?? [];
        const subjectsData = subjectsRes?.data ?? subjectsRes ?? [];

        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

        // OPTIMIZATION: Auto-fill teacher from localStorage or auth context
        const currentTeacherId =
          localStorage.getItem("teacherId") || user?.teacherId;
        if (currentTeacherId) {
          setValue("teacherId", parseInt(currentTeacherId));
        }
      } catch (error) {
        toast.error("Failed to load form data. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [setValue]);

  // Fetch teacher's subject and auto-fill it
  useEffect(() => {
    const fetchTeacherSubject = async () => {
      try {
        const currentTeacherId =
          localStorage.getItem("teacherId") || user?.teacherId;

        if (!currentTeacherId) return;

        // Fetch teacher data to get subject
        const teacherData = await teacherService.getById(currentTeacherId);

        if (teacherData?.subjectId) {
          setTeacherSubjectId(teacherData.subjectId);

          // Auto-fill the subject field
          setValue("subjectId", parseInt(teacherData.subjectId));

          // Get subject name for display
          const teacherSubject = subjects.find(
            (s) => s.id === teacherData.subjectId,
          );
          if (teacherSubject) {
            setTeacherSubjectName(teacherSubject.name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch teacher's subject:", error);
      }
    };

    if (subjects.length > 0) {
      fetchTeacherSubject();
    }
  }, [subjects, setValue, user?.teacherId]);

  const onSubmit = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const gradeData = {
          studentId: parseInt(data.studentId),
          subjectId: parseInt(data.subjectId),
          teacherId: parseInt(data.teacherId),
          score: parseFloat(data.score),
        };

        const newGrade = await gradeService.create(gradeData);

        // OPTIMIZATION: Invalidate React Query cache to fetch fresh grades data
        // Use predicate to match nested key structure: ["grades", "list", {...}]
        await queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "grades" && query.queryKey[1] === "list",
        });

        // BUG FIX: Clear local cache to prevent stale data on next filter/search
        clearGradesCache();

        // Add to context
        addGrade(newGrade);

        toast.success("Grade created successfully!");

        // Navigate back to grades list
        navigate("/app/grades");
      } catch (error) {
        let errorMessage = "Failed to create grade. Please try again.";

        if (error.response?.status === 400) {
          errorMessage = "Invalid data: Please check all fields and try again.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [addGrade, navigate, queryClient],
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/app/grades"
            className="p-2.5 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <FiArrowLeft size={22} />
          </Link>
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Create New Grade
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Record student performance for{" "}
              {teacherSubjectName || "your subject"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-2xl border shadow-sm overflow-hidden"
            style={{
              backgroundColor: "var(--color-surface-primary)",
              borderColor: "var(--color-border-primary)",
            }}
          >
            <div
              className="p-1 border-b"
              style={{
                borderColor: "var(--color-border-primary)",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <div className="px-5 py-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Grade Information
                </span>
              </div>
            </div>

            <div className="p-8">
              {dataLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
                      <div className="h-12 rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Student Selection */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold flex items-center gap-1.5"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Student <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <select
                          {...register("studentId", {
                            required: "Please select a student",
                          })}
                          className="w-full px-4 py-3 rounded-xl border appearance-none focus:outline-none focus:ring-4 transition-all"
                          style={{
                            borderColor: errors.studentId
                              ? "#ef4444"
                              : "var(--color-border-primary)",
                            color: watch("studentId")
                              ? "var(--color-text-primary)"
                              : "var(--color-text-secondary)",
                            backgroundColor: "var(--color-background-primary)",
                            "--tw-ring-color": errors.studentId
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(59, 130, 246, 0.1)",
                          }}
                        >
                          <option value="" disabled hidden>
                            Select a student from the list...
                          </option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name}{" "}
                              {student.id ? `(ID: ${student.id})` : ""}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {errors.studentId && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-red-500">
                          <FiAlertCircle size={14} />
                          {errors.studentId.message}
                        </div>
                      )}
                    </div>

                    {/* Score Input */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold flex items-center gap-1.5"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Grade Score <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 85.5"
                          {...register("score", {
                            required: "Score is required",
                            min: { value: 0, message: "Minimum score is 0" },
                            max: {
                              value: 100,
                              message: "Maximum score is 100",
                            },
                          })}
                          className="w-full pl-4 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-4 transition-all text-lg font-medium"
                          style={{
                            borderColor: errors.score
                              ? "#ef4444"
                              : "var(--color-border-primary)",
                            color: "var(--color-text-primary)",
                            backgroundColor: "var(--color-background-primary)",
                            "--tw-ring-color": errors.score
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(59, 130, 246, 0.1)",
                          }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <span className="text-sm font-bold text-gray-400">
                            / 100
                          </span>
                        </div>
                      </div>
                      {errors.score ? (
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-red-500">
                          <FiAlertCircle size={14} />
                          {errors.score.message}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          Enter a value between 0.0 and 100.0
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div
                    className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t"
                    style={{ borderTopColor: "var(--color-border-primary)" }}
                  >
                    <Link
                      to="/app/grades"
                      className="px-6 py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                      style={{
                        borderColor: "var(--color-border-primary)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <FiX size={18} />
                      Discard
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--color-interactive-primary)",
                      }}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave size={18} />
                          Save Grade
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Context/Info */}
        <div className="space-y-6">
          {/* Context Card */}
          <div
            className="rounded-2xl border p-6 space-y-6"
            style={{
              backgroundColor: "var(--color-surface-primary)",
              borderColor: "var(--color-border-primary)",
            }}
          >
            <h3
              className="font-bold text-lg"
              style={{ color: "var(--color-text-primary)" }}
            >
              Context Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight text-gray-400">
                    Subject
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {teacherSubjectName || "Loading..."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight text-gray-400">
                    Assigned By
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {user?.name || user?.firstName || "Current Teacher"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="pt-4 border-t border-dashed"
              style={{ borderColor: "var(--color-border-primary)" }}
            >
              <p className="text-xs leading-relaxed text-gray-500 italic">
                Grades are automatically linked to your teaching profile and
                current subject.
              </p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6">
            <h4 className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm mb-3">
              <FiAlertCircle size={16} />
              Quick Tips
            </h4>
            <ul className="text-xs space-y-2 text-amber-700/80 dark:text-amber-500/80 list-disc pl-4">
              <li>Ensure the score is accurate before saving.</li>
              <li>Grades can be edited later from the dashboard.</li>
              <li>Use decimal points for precise scoring (e.g. 88.5).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGrade;
