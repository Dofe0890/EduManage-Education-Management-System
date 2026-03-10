import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { queryKeys } from "../../config/queryClient";
import { useStudentData } from "../../contexts/StudentContext";
import { useTableData } from "../../hooks/useTableData";
import { studentService } from "../../services/studentService";
import SearchFilter from "../../components/common/SearchFilter";
import Pagination from "../../components/common/Pagination";
import StudentsGrid from "../../components/students/StudentsGrid";

/**
 * OPTIMIZATION: StudentsPage performance improvements
 * - Uses split context (useStudentData only, not full useStudentContext)
 * - Replaced loading overlay with skeleton placeholders
 * - Added local cache deduplication
 * - Passes data as props to StudentsGrid (not via context)
 */

/**
 * Query param names must match backend StudentFilterDTO + BaseFilterDTO:
 * StudentFilterDTO: name, age, classroomId, status (StudentStatus: 0 = Inactive, 1 = Active)
 * BaseFilterDTO: page, limit, orderBy (PascalCase e.g. Name, Age, CreatedAt), isDescending
 */
const QUERY_PARAMS = {
  search: "name",
  page: "page",
  limit: "limit",
  orderBy: "orderBy",
  isDescending: "isDescending",
};

/**
 * LOCAL CACHE: Deduplicate identical requests (prevents double-fetch in StrictMode or rapid navigation).
 * This works alongside React Query to prevent two identical requests in a short timeframe.
 */
const _studentsCache = new Map();

/**
 * Normalizes API response to { data, totalCount } and ensures each item
 * matches StudentDTO shape (id, name, age, classroomId, status, createdAt, updatedAt).
 * Includes local caching to deduplicate requests.
 */
const fetchStudents = async (params) => {
  const obj = Object.fromEntries(params.entries());
  const cacheKey = JSON.stringify(obj);

  // Return from local cache if available (deduplicates StrictMode double-mount)
  if (_studentsCache.has(cacheKey)) {
    return _studentsCache.get(cacheKey);
  }

  // Fetch from API
  const res = await studentService.getAll(obj);
  let data = [];
  let totalCount = 0;
  if (Array.isArray(res)) {
    data = res;
    totalCount = res.length;
  } else {
    data = res?.data ?? res?.items ?? [];
    totalCount = res?.totalCount ?? res?.total ?? res?.count ?? 0;
  }

  const normalized = { data, totalCount };
  _studentsCache.set(cacheKey, normalized);
  return normalized;
};

/** Filter config: keys match StudentFilterDTO (name, age, classroomId, status). */
const STUDENT_FILTERS = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "", label: "All" },
      { value: "1", label: "Active" },
      { value: "0", label: "Inactive" },
    ],
  },
  {
    name: "classroomId",
    label: "Classroom ID",
    type: "number",
    placeholder: "e.g. 1",
  },
  { name: "age", label: "Age", type: "number", placeholder: "e.g. 20" },
];

/** Sort options: orderBy values must match backend (PascalCase property names). */
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "Name", label: "Name" },
  { value: "Age", label: "Age" },
  { value: "CreatedAt", label: "Created At" },
  { value: "UpdatedAt", label: "Updated At" },
];

const StudentsPage = () => {
  // Only extract setStudentData (data operations, not UI state)
  const { setStudentData } = useStudentData();

  const table = useTableData({
    fetchData: fetchStudents,
    queryKeyPrefix: queryKeys.studentsListPrefix,
    initialPage: 1,
    initialLimit: 10,
    initialOrderBy: "",
    initialIsDescending: false,
    onSuccess: useCallback(
      (data, totalCount) => {
        setStudentData(data, totalCount);
      },
      [setStudentData],
    ),
    enabled: true,
  });

  // Diagnostic: Log table state
  // React.useEffect(() => {
  //   console.log("📊 useTableData state:", {
  //     dataLength: table.data?.length,
  //     loading: table.loading,
  //     error: table.error,
  //     totalCount: table.totalCount,
  //   });
  // }, [table.data, table.loading, table.error, table.totalCount]);

  const handleReset = useCallback(() => {
    table.reset();
  }, [table]);

  // OPTIMIZATION: Memoize skeleton rows to prevent re-creation
  const skeletonRows = useMemo(() => [...Array(5)], []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Students
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Manage and search students with filters and pagination
          </p>
        </div>
        <Link
          to="new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity shrink-0"
          style={{ backgroundColor: "var(--color-interactive-primary)" }}
        >
          + Add Student
        </Link>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        searchPlaceholder="Search by name…"
        searchParamName={QUERY_PARAMS.search}
        filters={STUDENT_FILTERS}
        onSearch={table.handleSearch}
        onReset={handleReset}
        debounceMs={300}
        sortOptions={SORT_OPTIONS}
        orderBy={table.orderBy}
        isDescending={table.isDescending}
        onSortChange={table.handleSortChange}
        className="shrink-0"
      />

      {/* Error banner */}
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
            // Shows visual feedback immediately, improves perceived latency
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
            // OPTIMIZATION: Pass data as props (not via context) for clean data flow
            <StudentsGrid data={table.data} loading={table.loading} />
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

export default StudentsPage;
