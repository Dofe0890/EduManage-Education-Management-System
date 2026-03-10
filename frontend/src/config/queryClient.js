import { QueryClient } from "@tanstack/react-query";

// Global React Query configuration for the entire application
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Time-based configurations
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        cacheTime: 10 * 60 * 1000, // 10 minutes - data kept in cache

        // Retry configurations
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          // Retry up to 3 times for 5xx errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => {
          // Exponential backoff: 1s, 2s, 4s, max 30s
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },

        // Refetch configurations
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnReconnect: true, // Refetch on reconnect
        refetchOnMount: true, // Refetch on component mount

        // Error handling
        throwOnError: false, // Don't throw errors, handle them in components

        // Background updates
        refetchInterval: false, // No automatic refetching
        refetchIntervalInBackground: false, // Don't refetch when tab is inactive

        // Data transformation
        select: (data) => data, // Default no transformation

        // Structural sharing
        structuralSharing: true, // Share data between queries
      },
      mutations: {
        // Retry configurations
        retry: 1, // Only retry mutations once

        // Error handling
        throwOnError: true, // Throw errors for mutations

        // Success handling
        onSuccess: () => {
          // Invalidate related queries on successful mutations
          // This will be implemented per mutation
        },

        // Error handling
        onError: (error) => {
        },
      },

      // Global defaults
      defaultOptions: {
        queries: {
          // Network status
          networkMode: "online", // Only fetch when online

          // Loading behavior
          keepPreviousData: true, // Keep previous data while loading new data

          // Pagination defaults
          getNextPageParam: (lastPage, allPages) => {
            // Default pagination logic
            return lastPage?.nextCursor;
          },

          // Error boundaries
          useErrorBoundary: false, // Handle errors in components
        },
      },
    },

    // Development/Production configurations
    logger: undefined,

    // Query cache configuration
    queryCache: undefined, // Use default

    // Mutation cache configuration
    mutationCache: undefined, // Use default
  });
};

// Default query client instance
export const queryClient = createQueryClient();

// Helper functions for common query patterns
export const queryKeys = {
  // User queries (CURRENT USER)
  currentUser: () => ["users", "current"],
  users: ["users"],
  user: (id) => ["users", id],
  profile: ["profile"],

  // Teacher queries
  teachers: ["teachers"],
  teacher: (id) => ["teachers", id],
  teacherStats: (id) => ["teachers", id, "stats"],
  teacherStudentCount: (id) => ["teachers", id, "student-count"],
  getDashboardMetrics: () => ["teachers", "dashboard-metrics"],
  teacherClasses: (id) => ["teachers", id, "classes"],
  recentActivities: (id) => ["teachers", id, "recent-activities"],

  // Student queries (list supports cache key for loader + useTableData)
  students: ["students"],
  student: (id) => ["students", id],
  studentsListPrefix: ["students", "list"],
  studentsList: (params) => ["students", "list", params],

  // Class/Classroom queries
  classes: ["classes"],
  class: (id) => ["classes", id],
  classesListPrefix: ["classes", "list"],
  classesList: (params) => ["classes", "list", params],
  classStudents: (id) => ["classes", id, "students"],

  // Subject queries
  subjects: ["subjects"],
  subjectsListPrefix: ["subjects", "list"],
  subjectsList: (params) => ["subjects", "list", params],

  // Grade queries
  grades: ["grades"],
  grade: (id) => ["grades", id],

  // Attendance queries
  attendance: ["attendance"],
  attendanceByClass: (classId) => ["attendance", "classes", classId],
};

// Helper functions for invalidating queries
export const invalidateQueries = (queryClient, key) => {
  return queryClient.invalidateQueries({ queryKey: key });
};

// Helper functions for prefetching queries
export const prefetchQuery = (queryClient, queryKey, queryFn) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 0, // Always prefetch
  });
};

// Helper functions for setting query data
export const setQueryData = (queryClient, queryKey, data) => {
  return queryClient.setQueryData(queryKey, data);
};

// Helper functions for getting query data
export const getQueryData = (queryClient, queryKey) => {
  return queryClient.getQueryData(queryKey);
};
