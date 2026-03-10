import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Build a stable list params object for React Query key.
 */
function listParamsKey(page, limit, orderBy, isDescending, filterParamsString) {
  return { page, limit, orderBy, isDescending, f: filterParamsString };
}

/**
 * Generic hook for server-side table data: search, filters, pagination, sorting.
 * When queryKeyPrefix is provided, uses React Query so loader can prefetch and avoid double load.
 *
 * @param {Object} options
 * @param {(params: URLSearchParams) => Promise<{ data: any[], totalCount: number }>} options.fetchData
 * @param {string[]} [options.queryKeyPrefix] - e.g. ['students', 'list']; enables React Query cache (loader can prefetch same key)
 * @param {number} [options.initialPage=1]
 * @param {number} [options.initialLimit=10]
 * @param {string} [options.initialOrderBy='']
 * @param {boolean} [options.initialIsDescending=false]
 * @param {(data: any[], totalCount: number) => void} [options.onSuccess]
 * @param {boolean} [options.enabled=true]
 */
export function useTableData({
  fetchData,
  queryKeyPrefix = null,
  initialPage = 1,
  initialLimit = 10,
  initialOrderBy = "",
  initialIsDescending = false,
  onSuccess,
  enabled = true,
}) {
  const queryClient = queryKeyPrefix ? useQueryClient() : null;
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [isDescending, setIsDescending] = useState(initialIsDescending);
  const [filterParamsString, setFilterParamsString] = useState("");

  const buildParams = useCallback(() => {
    const base = filterParamsString
      ? new URLSearchParams(filterParamsString)
      : new URLSearchParams();
    base.set("page", String(page));
    base.set("limit", String(limit));
    if (orderBy) {
      base.set("orderBy", orderBy);
      base.set("isDescending", String(isDescending));
    }
    return base;
  }, [filterParamsString, page, limit, orderBy, isDescending]);

  const queryKey = queryKeyPrefix
    ? [
        ...queryKeyPrefix,
        listParamsKey(page, limit, orderBy, isDescending, filterParamsString),
      ]
    : null;

  const queryFn = useCallback(async () => {
    const params = buildParams();
    const result = await fetchData(params);
    const items = result.data ?? result.items ?? [];
    const total = result.totalCount ?? result.total ?? result.count ?? 0;
    return { data: items, totalCount: total };
  }, [fetchData, buildParams]);

  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: queryKey ?? ["no-cache"],
    queryFn,
    enabled: enabled && !!queryKeyPrefix,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: "stale",
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    onSuccess: queryKeyPrefix
      ? (data) => {
          onSuccess?.(data.data ?? [], data.totalCount ?? 0);
        }
      : undefined,
  });

  // Derive state from React Query instead of syncing with useEffect
  const data = useMemo(
    () => (queryKeyPrefix ? (queryData?.data ?? []) : []),
    [queryKeyPrefix, queryData?.data],
  );

  const loading = useMemo(
    () => (queryKeyPrefix ? queryLoading : false),
    [queryKeyPrefix, queryLoading],
  );

  const error = useMemo(
    () => (queryKeyPrefix ? (queryError?.message ?? null) : null),
    [queryKeyPrefix, queryError],
  );

  const totalCount = useMemo(
    () => (queryKeyPrefix ? (queryData?.totalCount ?? 0) : 0),
    [queryKeyPrefix, queryData?.totalCount],
  );

  // Legacy fetch function for non-React Query mode (minimal usage)
  const performFetch = useCallback(
    async (params) => {
      try {
        const result = await fetchData(params);
        const items = result.data ?? result.items ?? [];
        const total = result.totalCount ?? result.total ?? result.count ?? 0;
        onSuccess?.(items, total);
        return { data: items, totalCount: total };
      } catch (err) {
        const errorMessage = err?.message ?? "Failed to load data";
        throw new Error(errorMessage);
      }
    },
    [fetchData, onSuccess],
  );

  // Use React Query's built-in refetch for non-React Query mode
  const {
    data: legacyData,
    isLoading: legacyLoading,
    error: legacyError,
    refetch: legacyRefetch,
  } = useQuery({
    queryKey: ["legacy", ...buildParams()],
    queryFn: () => performFetch(buildParams()),
    enabled: !queryKeyPrefix && enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: "stale",
    refetchOnWindowFocus: false,
  });

  // Merge React Query and legacy states
  const finalData = useMemo(
    () => (queryKeyPrefix ? data : (legacyData?.data ?? [])),
    [queryKeyPrefix, data, legacyData?.data],
  );

  const finalLoading = useMemo(
    () => (queryKeyPrefix ? loading : legacyLoading),
    [queryKeyPrefix, loading, legacyLoading],
  );

  const finalError = useMemo(
    () => (queryKeyPrefix ? error : (legacyError?.message ?? null)),
    [queryKeyPrefix, error, legacyError],
  );

  const finalTotalCount = useMemo(
    () => (queryKeyPrefix ? totalCount : (legacyData?.totalCount ?? 0)),
    [queryKeyPrefix, totalCount, legacyData?.totalCount],
  );

  const handleSearch = useCallback((searchParams) => {
    setFilterParamsString(searchParams.toString());
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage((p) => Math.max(1, newPage));
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newOrderBy, newIsDescending) => {
    setOrderBy(newOrderBy ?? "");
    setIsDescending(Boolean(newIsDescending));
    setPage(1);
  }, []);

  const refetch = useCallback(() => {
    if (queryKeyPrefix && queryClient) {
      queryRefetch();
    } else {
      legacyRefetch();
    }
  }, [queryKeyPrefix, queryClient, queryRefetch, legacyRefetch]);

  const reset = useCallback(() => {
    setFilterParamsString("");
    setPage(initialPage);
    setLimit(initialLimit);
    setOrderBy(initialOrderBy);
    setIsDescending(initialIsDescending);
  }, [initialPage, initialLimit, initialOrderBy, initialIsDescending]);

  const totalPages = Math.ceil(finalTotalCount / limit) || 1;
  const paginationInfo = useMemo(
    () => ({
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      startIndex: finalTotalCount === 0 ? 0 : (page - 1) * limit + 1,
      endIndex: Math.min(page * limit, finalTotalCount),
    }),
    [page, totalPages, finalTotalCount, limit],
  );

  return {
    data: finalData,
    loading: finalLoading,
    error: finalError,
    totalCount: finalTotalCount,
    page,
    limit,
    orderBy,
    isDescending,
    paginationInfo,
    handleSearch,
    handlePageChange,
    handleLimitChange,
    handleSortChange,
    refetch,
    reset,
  };
}

export default useTableData;
