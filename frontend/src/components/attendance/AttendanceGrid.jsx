import React, { useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useAttendanceData } from "../../contexts/AttendanceContext";
import { attendanceService } from "../../services/attendanceService";
import { ATTENDANCE_STATUS } from "../../hooks/useAttendance";
import {
  FiXCircle,
  FiCalendar,
  FiUsers,
  FiCheck,
  FiX,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import Swal from "sweetalert2";

/**
 * Utility function for safe date parsing.
 */
const formatDate = (date) => {
  if (!date) return "N/A";

  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid Date";
    }
    return parsedDate.toLocaleDateString();
  } catch (error) {
    return "Invalid Date";
  }
};

/**
 * Get status badge style based on attendance status.
 * Present: green, Absent: red, Late: orange, Excused: blue
 */
const getStatusBadgeStyle = (status) => {
  switch (status) {
    case ATTENDANCE_STATUS.PRESENT:
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
        icon: FiCheck,
      };
    case ATTENDANCE_STATUS.ABSENT:
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        icon: FiX,
      };
    case ATTENDANCE_STATUS.LATE:
      return {
        backgroundColor: "#ffedd5",
        color: "#9a3412",
        icon: FiClock,
      };
    case ATTENDANCE_STATUS.EXCUSED:
      return {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
        icon: FiArrowRight,
      };
    default:
      return {
        backgroundColor: "var(--color-background-secondary)",
        color: "var(--color-text-secondary)",
        icon: FiClock,
      };
  }
};

/**
 * Status badge component with icon and color.
 */
const StatusBadge = ({ status }) => {
  const style = getStatusBadgeStyle(status);
  const Icon = style.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
      }}
    >
      <Icon size={12} />
      {status || "Unknown"}
    </span>
  );
};

/**
 * Group attendance records by date for date-centric display.
 * Returns Map<dateString, { date, records }>
 * FIXED: Added date validation in sorting logic to prevent NaN errors
 */
const groupByDate = (attendances) => {
  const groups = new Map();

  for (const attendance of attendances || []) {
    const date =
      attendance.date ?? attendance.attendanceDate ?? attendance.AttendanceDate;
    const dateKey = date || "Unknown";

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date: dateKey,
        records: [],
      });
    }

    groups.get(dateKey).records.push(attendance);
  }

  // Sort groups by date (most recent first) with date validation
  const sortedGroups = new Map(
    [...groups.entries()].sort((a, b) => {
      if (a[0] === "Unknown") return 1;
      if (b[0] === "Unknown") return -1;

      try {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);

        // Validate dates before comparison
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0; // Keep original order if dates are invalid
        }

        return dateB - dateA; // Most recent first
      } catch {
        // Fallback: keep original order if any error occurs
        return 0;
      }
    }),
  );

  return sortedGroups;
};

/**
 * Group attendance records by classroom for classroom-centric display.
 * Returns Map<classroomId, { classroomId, classroomName, records }>
 */
const groupByClassroom = (attendances) => {
  const groups = new Map();

  for (const attendance of attendances || []) {
    const classroomId = attendance.classroomId ?? attendance.ClassroomId;
    const classroomName =
      attendance.classroomName ??
      attendance.Classroom?.name ??
      `Classroom ${classroomId}`;

    if (!groups.has(classroomId)) {
      groups.set(classroomId, {
        classroomId,
        classroomName,
        records: [],
      });
    }

    groups.get(classroomId).records.push(attendance);
  }

  return groups;
};

/**
 * Flatten grouped attendance for table display while maintaining context.
 * For date view: adds date group info
 * For classroom view: adds classroom group info
 */
const flattenAttendanceWithGroups = (attendances, viewMode) => {
  if (viewMode === "date") {
    const groups = groupByDate(attendances);
    const result = [];

    groups.forEach((group) => {
      group.records.forEach((record, index) => {
        result.push({
          ...record,
          groupDate: group.date,
          isFirstInGroup: index === 0,
          groupRecordCount: group.records.length,
        });
      });
    });

    return result;
  } else {
    const groups = groupByClassroom(attendances);
    const result = [];

    groups.forEach((group) => {
      group.records.forEach((record, index) => {
        result.push({
          ...record,
          groupClassroom: group.classroomName,
          isFirstInGroup: index === 0,
          groupRecordCount: group.records.length,
        });
      });
    });

    return result;
  }
};

const AttendanceGridComponent = ({
  data,
  loading,
  viewMode = "date",
  studentsMap = new Map(),
  studentsLoading = false,
}) => {
  const { removeAttendance } = useAttendanceData();

  // Transform flat attendance into grouped data for display
  const flattenedData = useMemo(
    () => flattenAttendanceWithGroups(data, viewMode),
    [data, viewMode],
  );

  // OPTIMIZATION: Move handleDelete before columns to fix closure issue
  const handleDelete = useCallback(
    async (attendance) => {
      const attendanceId = attendance.id ?? attendance.Id;
      const studentId = attendance.studentId ?? attendance.StudentId;
      // OPTIMIZATION: Use studentsMap for O(1) lookup by ID
      const studentName = studentsMap.get(studentId) ?? "this student";
      const date = formatDate(
        attendance.attendanceDate ?? attendance.AttendanceDate,
      );

      const result = await Swal.fire({
        title: "Delete Attendance Record?",
        html: `Are you sure you want to delete the attendance record for <strong>${studentName}</strong> on <strong>${date}</strong>?<br><br>This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        customClass: {
          popup: "swal2-popup",
          title: "swal2-title",
          content: "swal2-content",
        },
      });

      if (result.isConfirmed) {
        try {
          await attendanceService.delete(attendanceId);
          removeAttendance(attendanceId);

          await Swal.fire({
            title: "Deleted!",
            text: "Attendance record has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          await Swal.fire({
            title: "Error!",
            text: "Failed to delete attendance record. Please try again.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    },
    [removeAttendance, studentsMap],
  );

  const columns = useMemo(
    () => [
      // Group column (Date or Classroom depending on viewMode)
      {
        header: viewMode === "date" ? "Date" : "Classroom",
        accessorKey: viewMode === "date" ? "groupDate" : "groupClassroom",
        cell: ({ row }) => {
          const record = row.original;
          const isFirstInGroup = record.isFirstInGroup;
          const groupCount = record.groupRecordCount;

          if (viewMode === "date") {
            return (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--color-interactive-primary)",
                    color: "white",
                  }}
                >
                  <FiCalendar size={14} />
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {formatDate(record.groupDate)}
                  </p>
                  {isFirstInGroup && groupCount > 1 && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {groupCount} records
                    </p>
                  )}
                </div>
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--color-interactive-primary)",
                    color: "white",
                  }}
                >
                  <FiUsers size={14} />
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {record.groupClassroom}
                  </p>
                  {isFirstInGroup && groupCount > 1 && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {groupCount} records
                    </p>
                  )}
                </div>
              </div>
            );
          }
        },
      },
      {
        header: "Student",
        accessorKey: "studentName",
        cell: ({ row }) => {
          const record = row.original;
          const studentId = record.studentId ?? record.StudentId;
          const studentName =
            record.studentName ??
            studentsMap.get(studentId) ??
            record.Student?.name ??
            "Unknown";
          return (
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {studentName}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                ID: {studentId}
              </p>
            </div>
          );
        },
      },
      // Show Date column in classroom view, Classroom column in date view
      ...(viewMode === "classroom"
        ? [
            {
              header: "Date",
              accessorKey: "date",
              cell: ({ row }) => {
                const date =
                  row.original.date ??
                  row.original.attendanceDate ??
                  row.original.AttendanceDate;
                return (
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {formatDate(date)}
                  </div>
                );
              },
            },
          ]
        : [
            {
              header: "Classroom",
              accessorKey: "classroomName",
              cell: ({ row }) => {
                const record = row.original;
                const classroomName =
                  record.classroomName ??
                  record.Classroom?.name ??
                  `Classroom ${record.classroomId ?? record.ClassroomId}`;
                return (
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {classroomName}
                  </div>
                );
              },
            },
          ]),
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const record = row.original;
          let status =
            record.status ??
            record.Status ??
            record.attendanceStatus ??
            record.AttendanceStatus;
          if (typeof status === "boolean") {
            status = status ? "Present" : "Absent";
          }
        },
      },

      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-950"
              style={{ color: "#ef4444" }}
              title="Remove"
              aria-label={`Delete attendance for student ${row.original.studentId}`}
            >
              <FiXCircle size={16} />
            </button>
          </div>
        ),
      },
    ],
    [viewMode, handleDelete, studentsMap],
  );

  const table = useReactTable({
    data: flattenedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor: "var(--color-background-secondary)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            className="divide-y"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors"
                style={{ backgroundColor: "var(--color-background-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-background-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-background-primary)")
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4"
                    style={{ borderColor: "var(--color-border-primary)" }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && (!data || data.length === 0) && (
        <div className="text-center py-12">
          <p
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            No attendance records found
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * OPTIMIZATION: Wrap with React.memo to prevent re-renders when parent renders
 * but data/loading props haven't changed.
 */
export default React.memo(AttendanceGridComponent, (prevProps, nextProps) => {
  // Compare data arrays with null/falsy safety
  const dataSame =
    (prevProps.data ?? []).length === (nextProps.data ?? []).length &&
    prevProps.data === nextProps.data;

  return (
    dataSame &&
    prevProps.loading === nextProps.loading &&
    prevProps.viewMode === nextProps.viewMode
  );
});
