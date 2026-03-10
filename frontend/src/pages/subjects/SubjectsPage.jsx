import React, { useCallback, useState } from "react";
import { queryKeys } from "../../config/queryClient";
import { useTableData } from "../../hooks/useTableData";
import SearchFilter from "../../components/common/SearchFilter";
import Pagination from "../../components/common/Pagination";
import { subjectService } from "../../services/subjectService";
import SubjectsGrid from "../../components/subjects/SubjectsGrid";

/**
 * Query param names must match backend SubjectFilterDTO + BaseFilterDTO:
 * SubjectFilterDTO: name, description
 * BaseFilterDTO: page, limit, orderBy (PascalCase e.g. Name, Id, Description), isDescending
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
 * matches SubjectDTO shape for SubjectsContext and SubjectsGrid.
 */
const fetchSubjects = async (params) => {
  const obj = Object.fromEntries(params.entries());
  const res = await subjectService.getAll(obj);
  let data = [];
  let totalCount = 0;
  if (Array.isArray(res)) {
    data = res;
    totalCount = res.length;
  } else {
    data = res?.data ?? res?.items ?? [];
    totalCount = res?.totalCount ?? res?.total ?? res?.count ?? 0;
  }
  return { data, totalCount };
};

/** Filter config: keys match SubjectFilterDTO (name, description). */
const SUBJECT_FILTERS = [
  {
    name: "description",
    label: "Description",
    type: "text",
    placeholder: "Search in description...",
  },
];

/** Sort options: orderBy values must match backend (PascalCase property names). */
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "Id", label: "ID" },
  { value: "Name", label: "Name" },
  { value: "Description", label: "Description" },
];

const SubjectsPage = () => {
  const [Subjects, setSubjects] = useState([]);

  const table = useTableData({
    fetchData: fetchSubjects,
    queryKeyPrefix: queryKeys.subjectsListPrefix,
    initialPage: 1,
    initialLimit: 16,
    initialOrderBy: "id",
    initialIsDescending: false,
    onSuccess: useCallback(
      (data) => {
        setSubjects(data);
      },
      [setSubjects],
    ),
    enabled: true,
  });

  const subjectsToRender = Subjects?.length ? Subjects : table.data;

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
            Subjects
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            View and search subjects with filters and pagination
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        searchPlaceholder="Search by name…"
        searchParamName={QUERY_PARAMS.search}
        filters={SUBJECT_FILTERS}
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

      {/* Table + loading overlay */}
      <div
        className="relative rounded-xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          borderColor: "var(--color-border-primary)",
        }}
      >
        {table.loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-surface-primary)" }}
            aria-busy="true"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "var(--color-interactive-primary)",
                  borderTopColor: "var(--color-interactive-primary)",
                }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Loading…
              </span>
            </div>
          </div>
        )}
        <div className="p-4 sm:p-6">
          <SubjectsGrid subjects={subjectsToRender} loading={table.loading} />
        </div>

        {/* Pagination */}
        <div
          className="px-4 py-3"
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

export default SubjectsPage;
