import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGradeData } from "../../contexts/GradeContext";
import { useTableData } from "../../hooks/useTableData";
import { useSubjects } from "../../hooks/useSubjects";
import { useStudents } from "../../hooks/useStudents";
import { gradeService } from "../../services/gradeService";
import SearchFilter from "../../components/common/SearchFilter";
import Pagination from "../../components/common/Pagination";
import {
  clearGradesCache,
  fetchGradesWithCache,
} from "../../utils/gradesCache";
import GradesGrid from "../../components/grades/GradesGrid";

/**
 * OPTIMIZATION: GradesPage performance improvements
 * - Uses split context (useGradeData only, not full useGradeContext)
 * - Replaced loading overlay with skeleton placeholders
 * - Added local cache deduplication
 * - Passes data as props to GradesGrid (not via context)
 */

/**
 * Query param names must match backend GradeFilterDTO + BaseFilterDTO:
 * GradeFilterDTO: studentId, subjectId, teacherId, minScore, maxScore, dateGrade, dateFilterType
 * BaseFilterDTO: page, limit, orderBy, isDescending
 */
const QUERY_PARAMS = {
  search: "studentName", // Search by student name (frontend-side filter)
  page: "page",
  limit: "limit",
  orderBy: "orderBy",
  isDescending: "isDescending",
};

/** Filter config: keys match GradeFilterDTO. */

/**
 * Fetch grades using shared cache module
 * This ensures cache consistency across all grade operations
 */
const fetchGrades = async (params) => {
  return fetchGradesWithCache(params, gradeService.getAll);
};

/** Filter config: keys match GradeFilterDTO. */
const GRADE_FILTERS = [
  {
    name: "minScore",
    label: "Min Score",
    type: "number",
    placeholder: "e.g. 0",
  },
  {
    name: "maxScore",
    label: "Max Score",
    type: "number",
    placeholder: "e.g. 100",
  },
];

/** Sort options: orderBy values. */
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "Score", label: "Score" },
  { value: "DateGrade", label: "Date" },
];

const GradesPage = () => {
  // Only extract setGradeData (data operations, not UI state)
  const { setGradeData } = useGradeData();

  // OPTIMIZATION: Fetch all subjects using React Query for name resolution
  // Stale time: 5 minutes, keeps data in cache for fast lookups
  const {
    data: subjectsResponse,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSubjects({ limit: 1000 });

  // OPTIMIZATION: Fetch all students using React Query for name resolution
  // Stale time: 5 minutes, keeps data in cache for fast lookups
  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    error: studentsError,
  } = useStudents({ limit: 1000 });

  // DEBUG: Log subjects data to console
  React.useEffect(() => {
    console.log("🔍 Subjects Response:", subjectsResponse);
    console.log("📊 Subjects Loading:", subjectsLoading);
    console.log("❌ Subjects Error:", subjectsError);
  }, [subjectsResponse, subjectsLoading, subjectsError]);

  // DEBUG: Log students data to console
  React.useEffect(() => {
    console.log("🔍 Students Response:", studentsResponse);
    console.log("📊 Students Loading:", studentsLoading);
    console.log("❌ Students Error:", studentsError);
  }, [studentsResponse, studentsLoading, studentsError]);

  // OPTIMIZATION: Create subjects map for O(1) name lookup by ID
  // Memoized to prevent re-renders when subjects haven't changed
  const subjectsMap = useMemo(() => {
    const map = new Map();

    if (subjectsResponse?.data && Array.isArray(subjectsResponse.data)) {
      for (const subject of subjectsResponse.data) {
        if (subject.id && subject.name) {
          map.set(subject.id, subject.name);
        }
      }
    }

    // DEBUG: Log map contents
    console.log("🗺️ SubjectsMap created with", map.size, "entries");
    if (map.size > 0) {
      console.log("Sample entries:", Array.from(map.entries()).slice(0, 3));
    }

    return map;
  }, [subjectsResponse?.data]);

  // OPTIMIZATION: Create students map for O(1) name lookup by ID
  // Memoized to prevent re-renders when students haven't changed
  const studentsMap = useMemo(() => {
    const map = new Map();

    if (studentsResponse?.data && Array.isArray(studentsResponse.data)) {
      for (const student of studentsResponse.data) {
        if (student.id && student.name) {
          map.set(student.id, student.name);
        }
      }
    }

    // DEBUG: Log map contents
    console.log("👥 StudentsMap created with", map.size, "entries");
    if (map.size > 0) {
      console.log("Sample entries:", Array.from(map.entries()).slice(0, 3));
    }

    return map;
  }, [studentsResponse?.data]);

  const table = useTableData({
    fetchData: fetchGrades,
    queryKeyPrefix: ["grades", "list"],
    initialPage: 1,
    initialLimit: 10,
    initialOrderBy: "",
    initialIsDescending: false,
    onSuccess: useCallback(
      (data, totalCount) => {
        console.log(
          "🔙 GradesPage onSuccess callback: Received",
          data?.length ?? 0,
          "items from React Query",
        );
        setGradeData(data, totalCount);
      },
      [setGradeData],
    ),
    enabled: true,
  });

  const handleReset = useCallback(() => {
    table.reset();
  }, [table]);

  // OPTIMIZATION: Memoize skeleton rows as proper array to prevent re-creation
  const skeletonRows = useMemo(() => Array.from({ length: 5 }), []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Grades
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Manage student grades organized by subject
          </p>
        </div>
        <Link
          to="new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity shrink-0"
          style={{ backgroundColor: "var(--color-interactive-primary)" }}
        >
          + Add Grade
        </Link>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        searchPlaceholder="Search by student name…"
        searchParamName={QUERY_PARAMS.search}
        filters={GRADE_FILTERS}
        onSearch={table.handleSearch}
        onReset={handleReset}
        debounceMs={300}
        sortOptions={SORT_OPTIONS}
        orderBy={table.orderBy}
        isDescending={table.isDescending}
        onSortChange={table.handleSortChange}
        className="shrink-0"
      />

      {/* Error banner for grades fetch */}
      {table.error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-error-light)",
            borderColor: "var(--color-error)",
            color: "var(--color-error)",
          }}
          role="alert"
        >
          {table.error}
        </div>
      )}

      {/* Error banner for subjects fetch */}
      {subjectsError && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-error-light)",
            borderColor: "var(--color-error)",
            color: "var(--color-error)",
          }}
          role="alert"
        >
          Warning: Failed to load subject names. Subject IDs will be displayed
          instead.
        </div>
      )}

      {/* Table + skeleton loading */}
      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          borderColor: "var(--color-border-primary)",
        }}
      >
        <div className="p-4 sm:p-6">
          {table.loading ? (
            // OPTIMIZATION: Skeleton placeholder instead of overlay
            <div className="space-y-4">
              {skeletonRows.map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg animate-pulse"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                  }}
                />
              ))}
            </div>
          ) : (
            // OPTIMIZATION: Pass data and maps as props for clean data flow
            // Both maps provide O(1) lookup, prevent fallback names like "Subject 1" or "Unknown"
            <GradesGrid
              data={table.data}
              loading={table.loading}
              subjectsMap={subjectsMap}
              subjectsLoading={subjectsLoading}
              studentsMap={studentsMap}
              studentsLoading={studentsLoading}
            />
          )}
        </div>

        {/* Pagination */}
        <div
          className="px-4 py-3 border-t"
          style={{
            borderTopColor: "var(--color-border-primary)",
            backgroundColor: "var(--color-background-secondary)",
          }}
        >
          <Pagination
            currentPage={table.paginationInfo.currentPage}
            totalPages={table.paginationInfo.totalPages}
            totalCount={table.totalCount}
            startIndex={table.paginationInfo.startIndex}
            endIndex={table.paginationInfo.endIndex}
            onPageChange={table.handlePageChange}
            limit={table.limit}
            onLimitChange={table.handleLimitChange}
            showLimitSelector
          />
        </div>
      </div>
    </div>
  );
};

export default GradesPage;
