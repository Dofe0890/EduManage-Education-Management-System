import { queryKeys } from "../config/queryClient";
import { authService } from "../services";
import { teacherService } from "../services/teacherService";

/**
 * Dashboard Loader - React Router Data API Integration
 *
 * This loader prefetches critical dashboard data into React Query cache
 * during the navigation transition, ensuring instant page loads.
 *
 * ✨ OPTIMIZATION STRATEGY:
 * 1. Parallel Fetching: All requests start simultaneously (Promise.allSettled)
 * 2. Cache Hydration: Results are stored in React Query cache
 * 3. Instant Rendering: useQuery hooks read from cache (no network requests)
 * 4. Graceful Degradation: Failures in non-critical data don't block navigation
 *
 * Pattern: fetchQuery → Hydrates cache → useQuery reads cache (no network!)
 */
export const dashboardLoader =
  (queryClient) =>
  async ({ request, params }) => {
    // Get teacher ID from localStorage or auth context
    const teacherId = localStorage.getItem("teacherId");

    // 🛡️ GUARD: If no teacherId, don't attempt to fetch teacher-specific data
    if (!teacherId) {
      return {
        teacherId: null,
        currentUser: authService.getStoredUser(),
        activities: { status: "rejected", reason: "No teacherId" },
        loadedAt: new Date().toISOString(),
        loadTimeMs: 0,
        hasCurrentUser: !!authService.getStoredUser(),
        userError: null,
        teacherStudentCount: { status: "rejected" },
        dashboardMetricsQuery: { status: "rejected" },
      };
    }

    const startTime = performance.now();

    try {
      // 🚀 PHASE 1: Fetch Critical Data (Current User)
      // This MUST succeed for dashboard to work properly
      let currentUser = null;
      let userError = null;

      try {
        currentUser = authService.getStoredUser()
          ? authService.getStoredUser()
          : await authService.getCurrentUser();

        // Cache current user in React Query
        // queryClient.setQueryData(queryKeys.currentUser(), currentUser);

        // Also update localStorage for instant access
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        userError = error;
      }

      // 🚀 PHASE 2: Parallel Fetching - Teacher Statistics + Recent Activities
      // These are important but non-blocking - use Promise.allSettled
      const [teacherStudentCount, dashboardMetricsQuery, activitiesResult] =
        await Promise.allSettled([
          // Teacher statistics (most important for dashboard)
          queryClient.fetchQuery({
            queryKey: queryKeys.teacherStudentCount(teacherId),
            queryFn: () => teacherService.getStudentCount(teacherId),
            staleTime: 3 * 60 * 1000,
          }),
          queryClient.fetchQuery({
            queryKey: queryKeys.getDashboardMetrics(),
            queryFn: () => teacherService.getDashboardMetrics(),
            staleTime: 3 * 60 * 1000,
          }),

          // Recent activities (nice to have, non-critical)
          queryClient
            .fetchQuery({
              queryKey: queryKeys.recentActivities(teacherId),
              queryFn: () => teacherService.getRecentActivities(teacherId),
              staleTime: 5 * 60 * 1000, // 5 minutes
            })
            .catch(() => null), // Don't block if it fails
        ]);

      // Extract results

      // 🚀 PHASE 3: Prefetch Secondary Data (non-blocking)
      // These are fetched but not awaited - they'll be available shortly

      const endTime = performance.now();
      const loadTimeMs = Math.round(endTime - startTime);

      // Return comprehensive loader data
      return {
        teacherId,
        currentUser,
        activities: activitiesResult,
        loadedAt: new Date().toISOString(),
        loadTimeMs,
        prefetched: true,
        hasCurrentUser: !!currentUser,
        userError: userError?.message || null,
        teacherStudentCount,
        dashboardMetricsQuery,
      };
    } catch (error) {
      return {
        teacherId,
        currentUser: null,
        stats: null,
        activities: null,
        loadedAt: new Date().toISOString(),
        loadTimeMs: 0,
        hasCurrentUser: false,
        hasStats: false,
        error: error.message,
        isReady: false,
        dashboardMetricsQuery: { status: "rejected" },
        teacherStudentCount: { status: "rejected" },
      };
    }

    // Proper error handling - React Router will catch this
    // and render errorElement
  };

/**
 * Prefetch on hover helper
 * Use this for link hover prefetching
 */
