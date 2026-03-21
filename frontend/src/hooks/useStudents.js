import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "../services/studentService";
import { queryKeys } from "../config/queryClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useStudents = (filters) => {
  return useQuery({
    queryKey: queryKeys.studentsList(filters),
    queryFn: () => studentService.getAll(filters),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useStudent = (id) => {
  return useQuery({
    queryKey: queryKeys.student(id),
    queryFn: () => studentService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: studentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.studentsListPrefix);
      toast.success("Student created successfully");
      navigate("/students");
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }) => studentService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.student(variables.id), data);
      queryClient.invalidateQueries(queryKeys.studentsListPrefix);
      toast.success("Student updated successfully");
      navigate("/students");
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.studentsListPrefix);
      toast.success("Student deleted successfully");
    },
  });
};
