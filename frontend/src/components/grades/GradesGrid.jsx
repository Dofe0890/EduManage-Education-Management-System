import React, { useCallback, useMemo, useState, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useGradeData } from "../../contexts/GradeContext";
import { gradeService } from "../../services/gradeService";
import { FiEdit, FiXCircle, FiBook } from "react-icons/fi";
import Swal from "sweetalert2";
import { clearGradesCache } from "../../utils/gradesCache";

/**
 * OPTIMIZATION: Lazy load modal (loaded only when editing).
 * Reduces initial JS bundle size and parse time.
 */
const EditGradeModal = lazy(() => import("./EditGradeModal"));

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
 * Get score badge color based on score value.
 * 90+: green, 70-89: yellow, <70: red
 */
const getScoreBadgeStyle = (score) => {
  if (score >= 90) {
    return {
      backgroundColor: "#dcfce7",
      color: "#166534",
    };
  } else if (score >= 70) {
    return {
      backgroundColor: "#fef9c3",
      color: "#854d0e",
    };
  } else {
    return {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    };
  }
};

/**
 * Group grades by subject for subject-centric display.
 * OPTIMIZATION: Uses subjectsMap to resolve actual subject names instead of fallback
 * Returns Map<subjectId, { subjectName, grades }>
 */
const groupBySubject = (grades, subjectsMap = new Map()) => {
  const groups = new Map();

  // DEBUG: Log inputs
  console.log("🎯 groupBySubject called with:");
  console.log("  - Grades count:", grades?.length ?? 0);
  console.log("  - SubjectsMap size:", subjectsMap.size);
  if (subjectsMap.size > 0) {
    console.log(
      "  - Sample subjects:",
      Array.from(subjectsMap.entries()).slice(0, 3),
    );
  }

  for (const grade of grades || []) {
    // Handle both GradeDTO (flat) and GradeWithDetailsDTO (nested) formats
    const subjectId = grade.subjectId ?? grade.SubjectId;

    // OPTIMIZATION: Prefer subjectsMap lookup (O(1)) over nested object or fallback
    const subjectName =
      subjectsMap.get(subjectId) ??
      grade.Subject?.name ??
      grade.subjectName ??
      `Subject ${subjectId}`;

    // DEBUG: Log first few resolutions
    if (groups.size < 3) {
      console.log(
        `  - SubjectID ${subjectId} → ${subjectName} (from ${subjectsMap.has(subjectId) ? "map" : "fallback"})`,
      );
    }

    if (!groups.has(subjectId)) {
      groups.set(subjectId, {
        subjectId,
        subjectName,
        grades: [],
      });
    }

    groups.get(subjectId).grades.push(grade);
  }

  console.log("✅ Groups created:", groups.size);
  return groups;
};

/**
 * Flatten grouped grades for table display while maintaining subject context.
 * OPTIMIZATION: Accepts subjectsMap and studentsMap for name resolution
 */
const flattenGradesWithSubject = (
  grades,
  subjectsMap = new Map(),
  studentsMap = new Map(),
) => {
  const groups = groupBySubject(grades, subjectsMap);
  const result = [];

  groups.forEach((group) => {
    group.grades.forEach((grade, index) => {
      result.push({
        ...grade,
        subjectName: group.subjectName,
        isFirstInSubject: index === 0,
        subjectGradeCount: group.grades.length,
      });
    });
  });

  return result;
};

const GradesGridComponent = ({
  data,
  loading,
  subjectsMap = new Map(),
  subjectsLoading = false,
  studentsMap = new Map(),
  studentsLoading = false,
}) => {
  // DEBUG: Log props
  console.log("🎪 GradesGrid Component Rendered:");
  console.log("  - Data items:", data?.length ?? 0);
  console.log("  - SubjectsMap size:", subjectsMap.size);
  console.log("  - StudentsMap size:", studentsMap.size);
  console.log("  - Loading:", loading);
  console.log("  - SubjectsMap size:", subjectsMap.size);
  console.log("  - SubjectsLoading:", subjectsLoading);

  // OPTIMIZATION: React Query cache management
  // Invalidates cache after delete to fetch fresh data
  const queryClient = useQueryClient();

  // OPTIMIZATION: Only destructure operations (not data) from context
  const { removeGrade, updateGrade } = useGradeData();
  const [editingGrade, setEditingGrade] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // OPTIMIZATION: Transform flat grades into subject-grouped data for display
  // Now uses both subjectsMap and studentsMap for accurate name resolution
  const flattenedData = useMemo(() => {
    console.log(
      "📋 Computing flattenedData with subjectsMap size:",
      subjectsMap.size,
      "and studentsMap size:",
      studentsMap.size,
    );
    return flattenGradesWithSubject(data, subjectsMap, studentsMap);
  }, [data, subjectsMap, studentsMap]);

  const handleEdit = useCallback((grade) => {
    setEditingGrade(grade);
    setIsEditModalOpen(true);
  }, []);

  // OPTIMIZATION: Move handleDelete before columns to fix closure issue
  const handleDelete = useCallback(
    async (grade) => {
      const gradeId = grade.id ?? grade.Id;
      const studentId = grade.studentId ?? grade.StudentId;
      const studentName =
        studentsMap.get(studentId) ?? // 1. Direct map lookup (O(1))
        grade.Student?.name ?? // 2. Nested object
        grade.studentName ?? // 3. Flat field
        `Student ${studentId}`; // 4. Fallback with ID
      const subjectName = grade.subjectName;

      const result = await Swal.fire({
        title: "Delete Grade?",
        html: `Are you sure you want to delete the grade for <strong>${studentName}</strong> in <strong>${subjectName}</strong>?<br><br>This action cannot be undone.`,
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
          console.log("🕳️ Deleting grade ID:", gradeId);
          await gradeService.delete(gradeId);

          // OPTIMIZATION: Remove from local context immediately for instant UI feedback
          console.log(
            "📋 Local state: Removing grade",
            gradeId,
            "from context",
          );
          removeGrade(gradeId);

          // BUG FIX: Clear local cache to prevent stale data on next filter/search
          clearGradesCache();

          // OPTIMIZATION: Invalidate ALL grades queries (nested key structure)
          // invalidateQueries with predicate catches: ["grades", "list", {...}]
          console.log("🔄 Invalidating ALL grades queries...");
          await queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === "grades" && query.queryKey[1] === "list",
          });
          console.log("✅ Grades cache invalidated - will refetch fresh data");

          await Swal.fire({
            title: "Deleted!",
            text: "Grade has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          await Swal.fire({
            title: "Error!",
            text: "Failed to delete grade. Please try again.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    },
    [removeGrade, studentsMap, subjectsMap, queryClient],
  );

  // OPTIMIZATION: Memoize column definitions with proper dependencies
  const columns = useMemo(
    () => [
      {
        header: "Subject",
        accessorKey: "subjectName",
        cell: ({ row }) => {
          const { subjectName, isFirstInSubject, subjectGradeCount } =
            row.original;
          return (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: "var(--color-interactive-primary)",
                  color: "white",
                }}
              >
                <FiBook size={14} />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {subjectName}
                </p>
                {isFirstInSubject && subjectGradeCount > 1 && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {subjectGradeCount} grades
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        header: "Student",
        accessorKey: "studentName",
        cell: ({ row }) => {
          const grade = row.original;
          // Handle both GradeDTO and GradeWithDetailsDTO formats
          const studentId = grade.studentId ?? grade.StudentId;
          const studentName =
            studentsMap.get(studentId) ?? // 1. Direct map lookup (O(1))
            grade.Student?.name ?? // 2. Nested object
            grade.studentName ?? // 3. Flat field
            `Student ${studentId}`; // 4. Fallback with ID
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
      {
        header: "Score",
        accessorKey: "score",
        cell: ({ row }) => {
          const score = row.original.score ?? row.original.Score;
          return (
            <span
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={getScoreBadgeStyle(score)}
            >
              {score}
            </span>
          );
        },
      },
      {
        header: "Date",
        accessorKey: "dateGrade",
        cell: ({ row }) => {
          const date = row.original.dateGrade ?? row.original.DateGrade;
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
              className="p-2 rounded-md transition-colors hover:opacity-80"
              title="Edit"
              style={{ color: "var(--color-interactive-primary)" }}
            >
              <FiEdit size={16} />
            </button>
            {/* OPTIMIZATION: Use CSS class instead of inline hover handlers to avoid DOM mutations */}
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-950"
              style={{ color: "#ef4444" }}
              title="Remove"
              aria-label={`Delete grade for ${row.original.Student?.name ?? row.original.studentName ?? "student"}`}
            >
              <FiXCircle size={16} />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete, studentsMap],
  );

  const table = useReactTable({
    data: flattenedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleUpdateGrade = useCallback(
    (updatedGrade) => {
      const gradeId = updatedGrade.id ?? updatedGrade.Id;
      updateGrade(gradeId, updatedGrade);

      // BUG FIX: Clear local cache to prevent stale data on next filter/search
      clearGradesCache();

      Swal.fire({
        title: "Updated!",
        text: "Grade has been updated successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    [updateGrade],
  );

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingGrade(null);
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
            No grades found
          </p>
        </div>
      )}

      {/* OPTIMIZATION: Lazy load modal using Suspense */}
      <Suspense fallback={null}>
        <EditGradeModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          grade={editingGrade}
          onUpdate={handleUpdateGrade}
          studentsMap={studentsMap}
          subjectsMap={subjectsMap}
        />
      </Suspense>
    </div>
  );
};

/**
 * OPTIMIZATION: Wrap with React.memo to prevent re-renders when parent renders
 * but data/loading props haven't changed.
 * OPTIMIZATION: Improved comparator with null checks for falsy data arrays and maps.
 */
export default React.memo(GradesGridComponent, (prevProps, nextProps) => {
  // Compare data arrays with null/falsy safety
  const dataSame =
    (prevProps.data ?? []).length === (nextProps.data ?? []).length &&
    prevProps.data === nextProps.data;

  // Compare subjects map by size and loading state
  // (Full entry comparison would be expensive; size + loading is good proxy)
  const subjectsSame =
    (prevProps.subjectsMap?.size ?? 0) === (nextProps.subjectsMap?.size ?? 0) &&
    prevProps.subjectsLoading === nextProps.subjectsLoading;

  // Compare students map by size and loading state
  // (Full entry comparison would be expensive; size + loading is good proxy)
  const studentsSame =
    (prevProps.studentsMap?.size ?? 0) === (nextProps.studentsMap?.size ?? 0) &&
    prevProps.studentsLoading === nextProps.studentsLoading;

  return (
    dataSame &&
    prevProps.loading === nextProps.loading &&
    subjectsSame &&
    studentsSame
  );
});
