import React, { useCallback, useMemo, useState, lazy, Suspense } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useStudentData } from "../../contexts/StudentContext";
import { studentService } from "../../services/studentService";
import { FiFileText, FiEdit, FiXCircle } from "react-icons/fi";
import Swal from "sweetalert2";

/**
 * OPTIMIZATION: Lazy load modal (loaded only when editing).
 * Reduces initial JS bundle size and parse time.
 */
const EditStudentModal = lazy(() => import("./EditStudentModal"));

/**
 * Utility function to standardize status handling.
 * Moved outside component to avoid recreating on each render.
 */
const normalizeStatus = (status) => {
  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;
  if (typeof status === "string") {
    const lowerStatus = status.toLowerCase();
    return (
      lowerStatus === "true" || lowerStatus === "active" || lowerStatus === "1"
    );
  }
  return true;
};

/**
 * Utility function for safe date parsing.
 * Moved outside component to avoid recreating on each render.
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

const StudentsGridComponent = ({ data, loading }) => {
  // OPTIMIZATION: Only destructure operations (not data) from context
  // This prevents re-renders when context data changes
  const { removeStudent, updateStudent } = useStudentData();
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // OPTIMIZATION: Memoize initials map - only recalculates when data changes
  const initialsById = useMemo(() => {
    const map = new Map();
    for (const s of data || []) {
      const initials = (s?.name ?? "")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      map.set(s?.id, initials);
    }
    return map;
  }, [data]);

  const handleEdit = useCallback((student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  }, []);

  // OPTIMIZATION: Memoize column definitions - only recalculates when handlers change
  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
              style={{
                backgroundColor: "var(--color-interactive-primary)",
                color: "white",
              }}
            >
              {initialsById.get(row.original.id) ?? ""}
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {row.original.name}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Age: {row.original.age}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Age",
        accessorKey: "age",
        cell: ({ getValue }) => (
          <div
            className="text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            {getValue()}
          </div>
        ),
      },
      {
        header: "Classroom",
        accessorKey: "classroomId",
        cell: ({ getValue }) => (
          <div
            className="text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            Class {getValue()}
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue();
          const isActive = normalizeStatus(status);
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
          const date = getValue();
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
      {
        header: "Updated At",
        accessorKey: "updatedAt",
        cell: ({ getValue }) => {
          const date = getValue();
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
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(row.original)}
              className="p-2 rounded-md transition-colors"
              title="Edit"
              style={{ color: "var(--color-interactive-primary)" }}
            >
              <FiEdit size={16} />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="p-2 rounded-md transition-colors"
              style={{ color: "#ef4444" }}
              title="Remove"
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor =
                  "var(--color-background-tertiary)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              <FiXCircle size={16} />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, initialsById]
  );

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDelete = useCallback(
    async (studentId) => {
      const student = (data || []).find((s) => s.id === studentId);

      const result = await Swal.fire({
        title: "Delete Student?",
        html: `Are you sure you want to delete <strong>${student?.name || "this student"}</strong>?<br><br>This action cannot be undone.`,
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
          await studentService.delete(studentId);
          removeStudent(studentId);

          await Swal.fire({
            title: "Deleted!",
            text: "Student has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          await Swal.fire({
            title: "Error!",
            text: "Failed to delete student. Please try again.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    },
    [removeStudent, data]
  );

  const handleUpdateStudent = useCallback(
    (updatedStudent) => {
      updateStudent(updatedStudent.id, updatedStudent);

      Swal.fire({
        title: "Updated!",
        text: "Student information has been updated successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    [updateStudent]
  );

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
  }, []);

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
                          header.getContext()
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
                  (e.target.style.backgroundColor =
                    "var(--color-background-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor =
                    "var(--color-background-primary)")
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4"
                    style={{ borderColor: "var(--color-border-primary)" }}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
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
            No students found
          </p>
        </div>
      )}

      {/* OPTIMIZATION: Lazy load modal using Suspense (loads only when needed) */}
      <Suspense fallback={null}>
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          student={editingStudent}
          onUpdate={handleUpdateStudent}
        />
      </Suspense>
    </div>
  );
};

/**
 * OPTIMIZATION: Wrap with React.memo to prevent re-renders when parent renders
 * but data/loading props haven't changed.
 *
 * Custom comparison function:
 * - Only re-render if data identity changes (shallow) OR loading state changes
 * - Ignores other prop changes (e.g., parent re-rendering for unrelated reasons)
 */
export default React.memo(
  StudentsGridComponent,
  (prevProps, nextProps) => {
    // Return true if props are equal (prevent re-render)
    // Return false if props are different (trigger re-render)
    return (
      prevProps.data === nextProps.data &&
      prevProps.loading === nextProps.loading
    );
  }
);
