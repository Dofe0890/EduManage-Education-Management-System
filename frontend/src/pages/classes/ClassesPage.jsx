import React, { useCallback } from "react";
import { queryKeys } from "../../config/queryClient";
import { useTableData } from "../../hooks/useTableData";
import { classroomService } from "../../services/classroomService";
import SearchFilter from "../../components/common/SearchFilter";
import Pagination from "../../components/common/Pagination";
import ClassesGrid from "../../components/classes/ClassesGrid";

/**
 * Query param names must match backend ClassroomFilterDTO + BaseFilterDTO:
 * ClassroomFilterDTO: name
 * BaseFilterDTO: page, limit, orderBy (PascalCase e.g. Name), isDescending
 */
const QUERY_PARAMS = {
  search: "name",
  page: "page",
  limit: "limit",
  orderBy: "orderBy",
  isDescending: "isDescending",
};

/**
 * Normalizes API response to { data, totalCount } and ensures each item
 * matches ClassroomDTO shape (id, name) for ClassesGrid.
 */
// Lightweight in-memory cache to dedupe identical requests (prevents
// duplicate network calls when the component double-mounts in dev
// (React StrictMode) or otherwise renders twice).
const _classroomsCache = new Map();

const fetchClassrooms = async (params) => {
  const obj = Object.fromEntries(params.entries());
  const cacheKey = JSON.stringify(obj);

  if (_classroomsCache.has(cacheKey)) {
    return _classroomsCache.get(cacheKey);
  }

  const res = await classroomService.getAll(obj);
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
  _classroomsCache.set(cacheKey, normalized);
  return normalized;
};

/** Filter config: keys match ClassroomFilterDTO (name). */
const CLASSROOM_FILTERS = [
  {
    name: "name",
    label: "Class Name",
    type: "text",
    placeholder: "e.g. Math 101",
  },
];

/** Sort options: orderBy values must match backend (PascalCase property names). */
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "Name", label: "Name" },
];

const ClassesPage = () => {
  const table = useTableData({
    fetchData: fetchClassrooms,
    queryKeyPrefix: queryKeys.classesListPrefix,
    initialPage: 1,
    initialLimit: 10,
    initialOrderBy: "",
    initialIsDescending: false,
    enabled: true,
  });

  const handleReset = useCallback(() => {
    table.reset();
  }, [table]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Classes
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Manage and search classes with filters and pagination
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        searchPlaceholder="Search by class name…"
        searchParamName={QUERY_PARAMS.search}
        filters={CLASSROOM_FILTERS}
        onSearch={table.handleSearch}
        onReset={handleReset}
        debounceMs={300}
        sortOptions={SORT_OPTIONS}
        orderBy={table.orderBy}
        isDescending={table.isDescending}
        onSortChange={table.handleSortChange}
        className="shrink-0"
      />

      {/* Table + loading overlay */}
      <div
        className="relative rounded-xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          borderColor: "var(--color-border-primary)",
        }}
      >
        <div className="p-4 sm:p-6">
          {table.loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                  }}
                />
              ))}
            </div>
          ) : (
            <ClassesGrid data={table.data} loading={table.loading} />
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

export default ClassesPage;
