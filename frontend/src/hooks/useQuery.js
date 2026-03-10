import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { queryKeys, invalidateQueries } from "../config/queryClient";

// Custom hook for handling queries with error handling
export const useAppQuery = (queryKey, queryFn, options = {}) => {
  return useQuery({
    queryKey,
    queryFn,
    onError: (error) => {
      // Error is handled by axios interceptor, but we can add specific handling here if needed
    },
    ...options,
  });
};

// Custom hook for infinite queries
export const useAppInfiniteQuery = (queryKey, queryFn, options = {}) => {
  return useInfiniteQuery({
    queryKey,
    queryFn,
    onError: (error) => {
    },
    ...options,
  });
};

// Custom hook for mutations with success/error handling
export const useAppMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onError: (error) => {
      // Error is handled by axios interceptor
    },
    onSuccess: (data, variables, context) => {
      // Show success message if provided
      if (options.successMessage) {
        toast.success(options.successMessage);
      }

      // Invalidate related queries if specified
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          invalidateQueries(queryClient, queryKey);
        });
      }

      // Call custom onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

// Custom hook for optimistic updates
export const useOptimisticMutation = (mutationFn, queryKey, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old) => {
        if (options.updateFn) {
          return options.updateFn(old, newData);
        }
        return newData;
      });

      // Return context with previous data
      return { previousData };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: (data, variables, context) => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

export { useQueryClient, queryKeys, invalidateQueries };
