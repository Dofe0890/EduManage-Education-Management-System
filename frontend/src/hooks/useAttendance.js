import { useCallback } from "react";
import { useTableData } from "./useTableData";
import { attendanceService } from "../services/attendanceService";
import { queryKeys } from "../config/queryClient";

/**
 * Attendance status constants
 */
export const ATTENDANCE_STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

/**
 * Status options for dropdowns/filters
 */
export const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: ATTENDANCE_STATUS.PRESENT, label: "Present" },
  { value: ATTENDANCE_STATUS.ABSENT, label: "Absent" },
  { value: ATTENDANCE_STATUS.LATE, label: "Late" },
  { value: ATTENDANCE_STATUS.EXCUSED, label: "Excused" },
];

/**
 * Custom hook for attendance data with date/classroom filtering.
 * Wraps useTableData with attendance-specific configuration.
 *
 * @param {Object} options
 * @param {number} [options.teacherId] - Filter by teacher ID (for teacher-only views)
 * @param {number} [options.classroomId] - Filter by classroom ID
 * @param {number} [options.studentId] - Filter by student ID
 * @param {string} [options.attendanceDate] - Single date filter (YYYY-MM-DD)
 * @param {string} [options.dateFrom] - Date range start (YYYY-MM-DD)
 * @param {string} [options.dateTo] - Date range end (YYYY-MM-DD)
 * @param {string} [options.status] - Filter by status (Present/Absent/Late/Excused)
 * @param {Function} [options.onSuccess] - Callback on successful fetch
 * @param {boolean} [options.enabled=true] - Whether fetching is enabled
 */
export function useAttendance({
  teacherId,
  classroomId,
  studentId,
  attendanceDate,
  dateFrom,
  dateTo,
  status,
  onSuccess,
  enabled = true,
} = {}) {
  /**
   * Fetch attendance with optional pre-filtering.
   * Adds teacher/classroom/student/date filters to params if provided.
   */
  const fetchAttendance = useCallback(
    async (params) => {
      const obj = Object.fromEntries(params.entries());

      // Add pre-configured filters
      if (teacherId) obj.teacherId = teacherId;
      if (classroomId) obj.classroomId = classroomId;
      if (studentId) obj.studentId = studentId;
      if (attendanceDate) obj.attendanceDate = attendanceDate;
      if (dateFrom) obj.dateFrom = dateFrom;
      if (dateTo) obj.dateTo = dateTo;
      if (status) obj.status = status;

      const result = await attendanceService.getAll(obj);
      return result;
    },
    [teacherId, classroomId, studentId, attendanceDate, dateFrom, dateTo, status]
  );

  const table = useTableData({
    fetchData: fetchAttendance,
    queryKeyPrefix: queryKeys.attendanceListPrefix,
    initialPage: 1,
    initialLimit: 10,
    initialOrderBy: "AttendanceDate",
    initialIsDescending: true,
    onSuccess,
    enabled,
  });

  return table;
}

export default useAttendance;
