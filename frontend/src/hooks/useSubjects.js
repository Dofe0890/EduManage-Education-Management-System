import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../config/queryClient";
import { subjectService } from "../services/subjectService";

// Hook for fetching subjects list with caching
export const useSubjects = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.subjectsList(params),
    queryFn: () => subjectService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime in v4)
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching a single subject by ID
export const useSubject = (id) => {
  return useQuery({
    queryKey: queryKeys.subject(id),
    queryFn: () => subjectService.getById(id),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime in v4)
  });
};
