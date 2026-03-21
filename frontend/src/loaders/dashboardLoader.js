import { authService } from "../services";
import { teacherService } from "../services/teacherService";

export const dashboardLoader = async ({ request, params }) => {
  const teacherId = localStorage.getItem("teacherId");

  if (!teacherId) {
    return {
      teacherId: null,
      currentUser: authService.getStoredUser(),
      loadedAt: new Date().toISOString(),
      loadTimeMs: 0,
      hasCurrentUser: !!authService.getStoredUser(),
      userError: null,
      teacherStudentCount: { status: "rejected", reason: "No teacherId" },
      dashboardMetricsQuery: { status: "rejected", reason: "No teacherId" },
    };
  }

  const startTime = performance.now();

  let currentUser = null;
  let userError = null;

  try {
    currentUser = authService.getStoredUser()
      ? authService.getStoredUser()
      : await authService.getCurrentUser();
    localStorage.setItem("user", JSON.stringify(currentUser));
  } catch (error) {
    userError = error;
  }

  const [teacherStudentCountResult, dashboardMetricsResult] =
    await Promise.allSettled([
      teacherService.getStudentCount(teacherId),
      teacherService.getDashboardMetrics(),
    ]);

  const teacherStudentCount =
    teacherStudentCountResult.status === "fulfilled"
      ? { status: "fulfilled", value: teacherStudentCountResult.value }
      : { status: "rejected", reason: teacherStudentCountResult.reason };

  const dashboardMetricsQuery =
    dashboardMetricsResult.status === "fulfilled"
      ? { status: "fulfilled", value: dashboardMetricsResult.value }
      : { status: "rejected", reason: dashboardMetricsResult.reason };

  const endTime = performance.now();
  const loadTimeMs = Math.round(endTime - startTime);

  return {
    teacherId,
    currentUser,
    loadedAt: new Date().toISOString(),
    loadTimeMs,
    prefetched: true,
    hasCurrentUser: !!currentUser,
    userError: userError?.message || null,
    teacherStudentCount,
    dashboardMetricsQuery,
  };
};
