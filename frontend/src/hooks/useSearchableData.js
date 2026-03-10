import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Reusable hook for data fetching with SearchFilter integration
 * Supports pagination, sorting, and backend API calls
 */
export const useSearchableData = ({
  fetchData,
  initialPage = 1,
  initialLimit = 10,
  initialOrderBy = "",
  initialIsDescending = false,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [isDescending, setIsDescending] = useState(initialIsDescending);
  const [currentQueryParams, setCurrentQueryParams] = useState(
    new URLSearchParams(),
  );
  const isInitialMount = useRef(true);

  // Build complete query parameters including pagination and sorting
  const buildCompleteQueryParams = useCallback(
    (searchParams) => {
      const params = new URLSearchParams(searchParams);

      // Add pagination
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      // Add sorting
      if (orderBy) {
        params.append("orderBy", orderBy);
        params.append("isDescending", isDescending.toString());
      }

      return params;
    },
    [page, limit, orderBy, isDescending],
  );

  // Fetch data function
  const fetch = useCallback(
    async (searchParams) => {
      setLoading(true);
      setError(null);

      try {
        const completeParams = buildCompleteQueryParams(searchParams);
        const result = await fetchData(completeParams);

        setData(result.data || result.items || []);
        setTotalCount(result.totalCount || result.total || result.count || 0);
        setCurrentQueryParams(searchParams);
      } catch (err) {
        setError(err.message || "Failed to fetch data");

        // Fallback to mock data for development
        if (process.env.NODE_ENV === "development") {
          const mockData = [
            {
              id: 1,
              name: "John Doe",
              age: 20,
              classroomId: 1,
              status: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              name: "Jane Smith",
              age: 22,
              classroomId: 2,
              status: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 3,
              name: "Bob Johnson",
              age: 21,
              classroomId: 1,
              status: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          setData(mockData);
          setTotalCount(mockData.length);
        } else {
          setData([]);
          setTotalCount(0);
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchData, buildCompleteQueryParams],
  );

  // Handle search/filter changes from SearchFilter component
  const handleSearch = useCallback(
    (searchParams, setLoadingState) => {
      // Reset to first page when searching/filtering
      setPage(1);
      setLoadingState(true);
      fetch(searchParams);
    },
    [fetch],
  );

  // Handle pagination changes
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  // Handle sorting changes
  const handleSortChange = useCallback((newOrderBy, newIsDescending) => {
    setOrderBy(newOrderBy);
    setIsDescending(newIsDescending);
    setPage(1); // Reset to first page when sorting
  }, []);

  // Refetch when pagination or sorting changes
  useEffect(() => {
    if (currentQueryParams.toString()) {
      fetch(currentQueryParams);
    }
  }, [page, limit, orderBy, isDescending]);

  // Initial data fetch
  useEffect(() => {
    if (isInitialMount.current) {
      // Fetch initial data with empty search params
      const initialParams = new URLSearchParams();
      fetch(initialParams);
      isInitialMount.current = false;
    }
  }, [fetch]);

  // Calculate pagination info
  const paginationInfo = {
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    hasNextPage: page * limit < totalCount,
    hasPreviousPage: page > 1,
    startIndex: (page - 1) * limit + 1,
    endIndex: Math.min(page * limit, totalCount),
  };

  return {
    // Data state
    data,
    loading,
    error,
    totalCount,

    // Pagination state
    page,
    limit,
    paginationInfo,

    // Sorting state
    orderBy,
    isDescending,

    // Handlers
    handleSearch,
    handlePageChange,
    handleLimitChange,
    handleSortChange,

    // Utility functions
    refetch: () => fetch(currentQueryParams),
    reset: () => {
      setPage(initialPage);
      setLimit(initialLimit);
      setOrderBy(initialOrderBy);
      setIsDescending(initialIsDescending);
    },
  };
};

export default useSearchableData;
