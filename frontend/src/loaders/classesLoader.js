import { queryKeys } from "../config/queryClient";
import { classroomService } from "../services/classroomService";

/**
 * Prefetches first page of classes into React Query cache.
 * Uses the same query key structure as useTableData in ClassesPage for cache hit.
 */
export function classesLoader(queryClient) {
  return async () => {
    try {
      // Fetch first page directly from API (no hooks in loader)
      const response = await classroomService.getAll({
        page: 1,
        limit: 10,
      });

      // Normalize response
      const data = Array.isArray(response)
        ? response
        : (response?.data ?? response?.items ?? []);
      const totalCount =
        response?.totalCount ??
        response?.total ??
        response?.count ??
        data.length;

      // Build params object matching useTableData's key structure
      const params = {
        page: 1,
        limit: 10,
        orderBy: "",
        isDescending: false,
        f: "",
      };

      // Prefetch with the SAME key that ClassesPage's useTableData uses
      await queryClient.prefetchQuery({
        queryKey: [...queryKeys.classesListPrefix, params],
        queryFn: () => Promise.resolve({ data, totalCount }),
        staleTime: 2 * 60 * 1000,
      });

      return null;
    } catch (error) {
      throw new Response("Failed to load classes", { status: 500 });
    }
  };
}
