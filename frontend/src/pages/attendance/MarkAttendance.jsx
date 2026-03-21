import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAttendanceData } from "../../contexts/AttendanceContext";
import { attendanceService } from "../../services/attendanceService";
import { classroomService } from "../../services/classroomService";
import { studentService } from "../../services/studentService";
import { ATTENDANCE_STATUS } from "../../hooks/useAttendance";
import {
  FiCheck,
  FiX,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiArrowLeft,
  FiSearch,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";
import Swal from "sweetalert2";

/**
 * Mark Attendance Page
 * Bulk mark attendance for all students in a classroom on a single date.
 */
const MarkAttendance = () => {
  const navigate = useNavigate();
  const { addAttendance } = useAttendanceData();

  // Form state
  const [classroomId, setClassroomId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Data state
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch classrooms on mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      setIsLoading(true);
      try {
        const response = await classroomService.getAll({ limit: 100 });
        const classroomData = response.data ?? response.items ?? [];
        setClassrooms(classroomData);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to load classrooms.",
          icon: "error",
          confirmButtonColor: "var(--color-interactive-primary)",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  // Fetch students when classroom changes
  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      if (!classroomId) {
        if (isMounted) {
          setStudents([]);
          setAttendanceRecords([]);
        }
        return;
      }

      if (isMounted) setLoadingStudents(true);
      try {
        const response = await studentService.getAll({
          classroomId,
          limit: 100,
        });
        const studentData = response.data ?? response.items ?? [];

        if (isMounted) {
          setStudents(studentData);
          const records = studentData.map((student) => ({
            studentId: student.id ?? student.Id,
            studentName: student.name ?? student.Name,
            status: ATTENDANCE_STATUS.PRESENT,
          }));
          setAttendanceRecords(records);
        }
      } catch (error) {
        if (isMounted) {
          setStudents([]);
          setAttendanceRecords([]);
        }
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    };

    fetchStudents();
    return () => {
      isMounted = false;
    };
  }, [classroomId]);

  const handleStatusChange = useCallback((studentId, status) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record,
      ),
    );
  }, []);

  const handleBulkMark = useCallback((status) => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, status })),
    );
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!classroomId) newErrors.classroomId = "Please select a classroom";
    if (!attendanceDate) newErrors.attendanceDate = "Please select a date";
    if (attendanceRecords.length === 0 && classroomId && !loadingStudents) {
      newErrors.students = "No students in this classroom";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [classroomId, attendanceDate, attendanceRecords, loadingStudents]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const bulkRecords = attendanceRecords.map((record) => ({
          studentId: record.studentId,
          classroomId: parseInt(classroomId),
          date: new Date(attendanceDate + "T00:00:00Z"),
          isPresent: record.status === ATTENDANCE_STATUS.PRESENT,
        }));

        const result = await attendanceService.bulkUpdate(bulkRecords);

        if (result && Array.isArray(result)) {
          result.forEach((record) => addAttendance(record));
        }

        await Swal.fire({
          title: "Success!",
          text: `Attendance saved for ${attendanceRecords.length} students.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/app/attendance/records");
      } catch (error) {
        Swal.fire({
          title: "Submission Failed",
          text: error.message || "Failed to submit attendance.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      attendanceRecords,
      classroomId,
      attendanceDate,
      addAttendance,
      navigate,
    ],
  );

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return attendanceRecords;
    return attendanceRecords.filter(
      (r) =>
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentId.toString().includes(searchQuery),
    );
  }, [attendanceRecords, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts = {
      [ATTENDANCE_STATUS.PRESENT]: 0,
      [ATTENDANCE_STATUS.ABSENT]: 0,
    };
    attendanceRecords.forEach((record) => {
      if (record.status === ATTENDANCE_STATUS.PRESENT)
        counts[ATTENDANCE_STATUS.PRESENT]++;
      else counts[ATTENDANCE_STATUS.ABSENT]++;
    });
    return counts;
  }, [attendanceRecords]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/app/attendance/records")}
          className="flex items-center gap-2 text-sm font-medium transition-colors w-fit"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <FiArrowLeft /> Back to Records
        </button>
        <div className="flex justify-between items-end">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Mark Attendance
            </h1>
            <p
              className="text-base mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Record daily presence for your students.
            </p>
          </div>
          <div className="hidden md:flex gap-4">
            <div
              className="text-center px-4 py-2 rounded-lg border shadow-sm"
              style={{
                backgroundColor: "var(--color-surface-primary)",
                borderColor: "var(--color-border-primary)",
              }}
            >
              <span
                className="block text-xs font-semibold uppercase tracking-wider opacity-60"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Total Students
              </span>
              <span
                className="text-xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {attendanceRecords.length}
              </span>
            </div>
            <div
              className="text-center px-4 py-2 rounded-lg border shadow-sm"
              style={{
                backgroundColor: "var(--color-success-light)",
                borderColor: "var(--color-success)",
              }}
            >
              <span
                className="block text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-success)" }}
              >
                Present
              </span>
              <span
                className="text-xl font-bold"
                style={{ color: "var(--color-success)" }}
              >
                {statusCounts[ATTENDANCE_STATUS.PRESENT]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Selection Card */}
        <div
          className="rounded-2xl shadow-sm border overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface-primary)",
            borderColor: "var(--color-border-primary)",
          }}
        >
          <div
            className="p-6 border-b flex items-center gap-3"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: "var(--color-interactive-primary-light)",
                color: "var(--color-interactive-primary)",
              }}
            >
              <FiCalendar size={20} />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              1. Selection & Date
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Select Classroom
              </label>
              <select
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all"
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-primary)",
                  color: "var(--color-text-primary)",
                }}
                disabled={isLoading}
              >
                <option value="">Choose a classroom...</option>
                {classrooms.map((c) => (
                  <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                    {c.name ?? c.Name}
                  </option>
                ))}
              </select>
              {errors.classroomId && (
                <p
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--color-error)" }}
                >
                  <FiAlertCircle /> {errors.classroomId}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Attendance Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all"
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-primary)",
                  color: "var(--color-text-primary)",
                }}
              />
              {errors.attendanceDate && (
                <p
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--color-error)" }}
                >
                  <FiAlertCircle /> {errors.attendanceDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Student List Card */}
        {classroomId && (
          <div
            className="rounded-2xl shadow-sm border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              backgroundColor: "var(--color-surface-primary)",
              borderColor: "var(--color-border-primary)",
            }}
          >
            <div
              className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{ borderColor: "var(--color-border-primary)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: "var(--color-interactive-primary-light)",
                    color: "var(--color-interactive-primary)",
                  }}
                >
                  <FiUsers size={20} />
                </div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  2. Attendance List
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <FiSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm rounded-lg border focus:ring-2 w-full md:w-64"
                    style={{
                      backgroundColor: "var(--color-background-primary)",
                      borderColor: "var(--color-border-primary)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </div>
                <div
                  className="flex gap-1 p-1 rounded-lg"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleBulkMark(ATTENDANCE_STATUS.PRESENT)}
                    className="px-3 py-1.5 text-xs font-bold rounded-md shadow-sm transition-colors"
                    style={{
                      backgroundColor: "var(--color-surface-primary)",
                      color: "var(--color-success)",
                    }}
                  >
                    All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkMark(ATTENDANCE_STATUS.ABSENT)}
                    className="px-3 py-1.5 text-xs font-bold rounded-md transition-colors"
                    style={{ color: "var(--color-error)" }}
                  >
                    All Absent
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-[300px] relative">
              {loadingStudents ? (
                <div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  style={{
                    backgroundColor:
                      "rgba(var(--color-surface-primary-rgb), 0.8)",
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-10 h-10 border-4 rounded-full animate-spin"
                      style={{
                        borderColor: "var(--color-interactive-primary-light)",
                        borderTopColor: "var(--color-interactive-primary)",
                      }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Loading student roster...
                    </p>
                  </div>
                </div>
              ) : filteredRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className="text-left border-b"
                        style={{
                          backgroundColor: "var(--color-background-secondary)",
                          borderColor: "var(--color-border-primary)",
                        }}
                      >
                        <th
                          className="px-6 py-4 text-xs font-bold uppercase tracking-widest"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          Student Information
                        </th>
                        <th
                          className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-center"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ borderColor: "var(--color-border-primary)" }}
                    >
                      {filteredRecords.map((record) => (
                        <tr
                          key={record.studentId}
                          className="transition-colors group"
                          style={{
                            borderBottomColor: "var(--color-border-primary)",
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform"
                                style={{
                                  backgroundColor:
                                    "var(--color-interactive-primary)",
                                }}
                              >
                                {record.studentName.charAt(0)}
                              </div>
                              <div>
                                <p
                                  className="text-sm font-bold"
                                  style={{ color: "var(--color-text-primary)" }}
                                >
                                  {record.studentName}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{
                                    color: "var(--color-text-tertiary)",
                                  }}
                                >
                                  ID: {record.studentId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-4">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    record.studentId,
                                    ATTENDANCE_STATUS.PRESENT,
                                  )
                                }
                                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                                  record.status === ATTENDANCE_STATUS.PRESENT
                                    ? "shadow-md scale-105"
                                    : "hover:scale-105"
                                }`}
                                style={{
                                  backgroundColor:
                                    record.status === ATTENDANCE_STATUS.PRESENT
                                      ? "var(--color-success)"
                                      : "var(--color-background-secondary)",
                                  color:
                                    record.status === ATTENDANCE_STATUS.PRESENT
                                      ? "white"
                                      : "var(--color-text-tertiary)",
                                }}
                              >
                                <FiCheck size={16} /> Present
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    record.studentId,
                                    ATTENDANCE_STATUS.ABSENT,
                                  )
                                }
                                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                                  record.status === ATTENDANCE_STATUS.ABSENT
                                    ? "shadow-md scale-105"
                                    : "hover:scale-105"
                                }`}
                                style={{
                                  backgroundColor:
                                    record.status === ATTENDANCE_STATUS.ABSENT
                                      ? "var(--color-error)"
                                      : "var(--color-background-secondary)",
                                  color:
                                    record.status === ATTENDANCE_STATUS.ABSENT
                                      ? "white"
                                      : "var(--color-text-tertiary)",
                                }}
                              >
                                <FiX size={16} /> Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="py-20 flex flex-col items-center justify-center gap-4"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <FiUsers size={48} className="opacity-20" />
                  <p className="text-sm">No students found for selection.</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div
              className="p-6 border-t flex items-center justify-between"
              style={{
                backgroundColor: "var(--color-background-secondary)",
                borderColor: "var(--color-border-primary)",
              }}
            >
              <div
                className="flex items-center gap-2 text-sm italic"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <FiInfo style={{ color: "var(--color-interactive-primary)" }} />
                Double check the list before saving.
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/app/attendance/records")}
                  className="px-6 py-2.5 text-sm font-bold transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || attendanceRecords.length === 0}
                  className="px-8 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center gap-2"
                  style={{
                    backgroundColor: "var(--color-interactive-primary)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle /> Confirm & Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default MarkAttendance;
