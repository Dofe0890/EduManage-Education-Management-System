import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classroomService } from "../services/classroomService";
import { queryKeys } from "../config/queryClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useClassrooms = (filters) => {
  return useQuery({
    queryKey: queryKeys.classesList(filters),
    queryFn: () => classroomService.getAll(filters),
    keepPreviousData: true,
  });
};

export const useClassroom = (id) => {
  return useQuery({
    queryKey: queryKeys.class(id),
    queryFn: () => classroomService.getById(id),
    enabled: !!id,
  });
};

export const useAssignTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classroomId, teacherId }) =>
      classroomService.assignTeacher(classroomId, teacherId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(queryKeys.classesListPrefix);
      queryClient.invalidateQueries(queryKeys.class(variables.classroomId));

      // Show success message with teacher and classroom info if available
      const successMessage = data?.message || "Teacher assigned successfully";
      toast.success(successMessage);
    },
    onError: (error) => {
      // Handle special error types with toast instead of throwing
      if (error.isDuplicateAssignment) {
        toast.warning(
          error.userMessage ||
            "This teacher is already assigned to this classroom",
        );
        return; // Don't throw - handle gracefully
      }

      if (error.isPermissionError) {
        toast.error(
          error.userMessage || "You can only assign yourself to classrooms",
        );
        return; // Don't throw - handle gracefully
      }

      // For other errors, show error toast but don't crash the app
      toast.error(error.message || "Failed to assign teacher");
    },
  });
};
