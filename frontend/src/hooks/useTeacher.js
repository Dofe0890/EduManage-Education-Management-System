import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "../services/teacherService";
import { queryKeys } from "../config/queryClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useTeachers = (filters) => {
  return useQuery({
    queryKey: queryKeys.teachers,
    queryFn: () => teacherService.getAll(filters),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTeacher = (id) => {
  return useQuery({
    queryKey: queryKeys.teacher(id),
    queryFn: () => teacherService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTeacherByUserId = () => {
  return useQuery({
    queryKey: queryKeys.teacher("me"),
    queryFn: () => teacherService.getByUserId(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTeacherStudentCount = (teacherId) => {
  return useQuery({
    queryKey: queryKeys.teacherStudentCount(teacherId),
    queryFn: () => teacherService.getStudentCount(teacherId),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTeacherDashboardMetrics = (params) => {
  return useQuery({
    queryKey: queryKeys.getDashboardMetrics(),
    queryFn: () => teacherService.getDashboardMetrics(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: teacherService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["teachers"]);
      toast.success("Teacher created successfully");
      navigate("/teachers");
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }) => teacherService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["teacher", variables.id], data);
      queryClient.invalidateQueries(["teachers"]);
      toast.success("Teacher updated successfully");
      navigate("/teachers");
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["teachers"]);
      toast.success("Teacher deleted successfully");
    },
  });
};