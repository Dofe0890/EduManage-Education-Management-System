import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAttendanceData } from "../../contexts/AttendanceContext";
import { useTableData } from "../../hooks/useTableData";
import { useStudents } from "../../hooks/useStudents";
import { attendanceService } from "../../services/attendanceService";
import SearchFilter from "../../components/common/SearchFilter";
import Pagination from "../../components/common/Pagination";
import AttendanceGrid from "../../components/attendance/AttendanceGrid";

/**
 * OPTIMIZATION: AttendancesPage with date-centric view
 * - Uses split context (useAttendanceData only, not full useAttendanceContext)
 * - Replaced loading overlay with skeleton placeholders
 * - Added local cache deduplication
 * - Passes data as props to AttendanceGrid (not via context)
 * - View mode toggle: Date view (default) vs Classroom view
 */

/**
 * Query param names must match backend AttendanceFilterDTO + BaseFilterDTO:
 * AttendanceFilterDTO: studentId, fromDate, toDate, isPresent
 * BaseFilterDTO: page, limit, orderBy, isDescending
 */
const QUERY_PARAMS = {
  search: "studentName", // Search by student name (frontend-side filter)
  page: "page",
  limit: "limit",
  orderBy: "orderBy",
  isDescending: "isDescending",
};

/**
 * LOCAL CACHE: Deduplicate identical requests (prevents double-fetch in StrictMode or rapid navigation).
 * OPTIMIZATION: Prevents memory leak by clearing cache when it exceeds 50 entries.
 */
const _attendanceCache = new Map();
const MAX_CACHE_SIZE = 50;

/**
 * Normalizes API response to { data, totalCount }.
 * Includes local caching to deduplicate requests with LRU-style cleanup.
 */
const fetchAttendances = async (params) => {
  const obj = Object.fromEntries(params.entries());
  const cacheKey = JSON.stringify(obj);

  // OPTIMIZATION: Clear cache if it exceeds max size to prevent memory leak
  if (_attendanceCache.size > MAX_CACHE_SIZE) {
    _attendanceCache.clear();
  }

  // Return from local cache if available
  if (_attendanceCache.has(cacheKey)) {
    return _attendanceCache.get(cacheKey);
  }

  // Fetch from API
  const res = await attendanceService.getAll(obj);
  let data = [];
  let totalCount = 0;

  if (res && typeof res === "object") {
    data = res.data ?? res.items ?? [];
    totalCount = res.totalCount ?? res.total ?? res.count ?? 0;
  }

  const normalized = { data, totalCount };
  _attendanceCache.set(cacheKey, normalized);
  return normalized;
};

/** Filter config: keys match AttendanceFilterDTO. */
const ATTENDANCE_FILTERS = [
  {
    name: "studentId",
    label: "Student ID",
    type: "number",
    placeholder: "e.g. 1",
  },
  {
    name: "fromDate",
    label: "From Date",
    type: "date",
    placeholder: "Start date",
  },
  {
    name: "toDate",
    label: "To Date",
    type: "date",
    placeholder: "End date",
  },
  {
    name: "isPresent",
    label: "Presence Status",
    type: "select",
    options: [
      { value: "", label: "All" },
      { value: "true", label: "Present" },
      { value: "false", label: "Absent" },
    ],
  },
];

/** Sort options: orderBy values. Must match Attendance model properties. */
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "Date", label: "Attendance Date" },
  { value: "StudentId", label: "Student ID" },
  { value: "IsPresent", label: "Presence Status" },
];

/** View mode constants */
const VIEW_MODES = {
  DATE: "date",
  CLASSROOM: "classroom",
};

/** Get persisted view mode from localStorage */
const getPersistedViewMode = () => {
  try {
    return localStorage.getItem("attendanceViewMode") || VIEW_MODES.CLASSROOM;
  } catch {
    return VIEW_MODES.CLASSROOM;
  }
};

/** Persist view mode to localStorage */
const persistViewMode = (mode) => {
  try {
    localStorage.setItem("attendanceViewMode", mode);
  } catch {
    // Ignore localStorage errors
  }
};

const AttendancesPage = () => {
  // Only extract setAttendanceData (data operations, not UI state)
  const { setAttendanceData } = useAttendanceData();
  const [searchParams, setSearchParams] = useSearchParams();

  // OPTIMIZATION: Fetch all students using React Query for name resolution
  // Stale time: 5 minutes, keeps data in cache for fast lookups
  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    error: studentsError,
  } = useStudents({ limit: 1000 });

  // View mode state (persisted in localStorage + URL)
  const [viewMode, setViewMode] = useState(() => {
    const urlView = searchParams.get("view");
    if (urlView === VIEW_MODES.CLASSROOM || urlView === VIEW_MODES.DATE) {
      return urlView;
    }
    return getPersistedViewMode();
  });

  const table = useTableData({
    fetchData: fetchAttendances,
    queryKeyPrefix: ["attendance", "list"],
    initialPage: 1,
    initialLimit: 10,
    initialOrderBy: "ClassroomId", // Default sort by Classroom
    initialIsDescending: false,
    onSuccess: useCallback(
      (data, totalCount) => {
        setAttendanceData(data, totalCount);
      },
      [setAttendanceData],
    ),
    enabled: true,
  });

  const handleReset = useCallback(() => {
    table.reset();
  }, [table]);

  // Handle view mode toggle
  const handleViewModeChange = useCallback(
    (newMode) => {
      setViewMode(newMode);
      persistViewMode(newMode);
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("view", newMode);
          return newParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

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

    return map;
  }, [studentsResponse?.data]);

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
            Attendance Records
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Manage student attendance organized by date and classroom
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div
            className="flex items-center rounded-lg border p-1"
            style={{
              borderColor: "var(--color-border-primary)",
              backgroundColor: "var(--color-background-secondary)",
            }}
          >
            <button
              onClick={() => handleViewModeChange(VIEW_MODES.DATE)}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor:
                  viewMode === VIEW_MODES.DATE
                    ? "var(--color-interactive-primary)"
                    : "transparent",
                color:
                  viewMode === VIEW_MODES.DATE
                    ? "white"
                    : "var(--color-text-secondary)",
              }}
            >
              Date View
            </button>
            <button
              onClick={() => handleViewModeChange(VIEW_MODES.CLASSROOM)}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor:
                  viewMode === VIEW_MODES.CLASSROOM
                    ? "var(--color-interactive-primary)"
                    : "transparent",
                color:
                  viewMode === VIEW_MODES.CLASSROOM
                    ? "white"
                    : "var(--color-text-secondary)",
              }}
            >
              Classroom View
            </button>
          </div>
          <Link
            to="/app/attendance/mark"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity shrink-0"
            style={{ backgroundColor: "var(--color-interactive-primary)" }}
          >
            + Mark Attendance
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        searchPlaceholder="Search by student name…"
        searchParamName={QUERY_PARAMS.search}
        filters={ATTENDANCE_FILTERS}
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
            // OPTIMIZATION: Pass data and map as props for clean data flow
            // Map provides O(1) lookup, prevents "Unknown" student names
            <AttendanceGrid
              data={table.data}
              loading={table.loading}
              viewMode={viewMode}
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

export default AttendancesPage;
