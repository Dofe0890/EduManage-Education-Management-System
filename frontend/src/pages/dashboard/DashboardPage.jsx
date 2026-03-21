import { useLoaderData, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useCallback } from "react";
import {
  FiUsers,
  FiBook,
  FiAward,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiCheckCircle,
  FiPlus,
  FiFileText,
  FiChevronRight,
} from "react-icons/fi";
import { queryKeys } from "../../config/queryClient";
import { teacherService } from "../../services/teacherService";
import { useAuth } from "../../hooks/useAuth";
import TeacherStudentCountDashboard from "../../components/dashboard/TeacherStudentCountDashboard.jsx";
import HighestAverageCard from "../../components/dashboard/HighestAverageCard.jsx";
import HighestAttendanceCard from "../../components/dashboard/HighestAttendanceCard.jsx";
import SubjectLabel from "../../components/dashboard/SubjectLabel.jsx";
import Loading from "../../components/common/Loading";

const DashboardPage = () => {
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const { teacherId: authTeacherId } = useAuth();
  const {
    dashboardMetricsQuery,
    teacherStudentCount,
    currentUser,
    activities,
  } = loaderData;

  // Safely extract dashboard metrics with fallbacks
  const dashboardMetrics =
    dashboardMetricsQuery?.status === "fulfilled"
      ? dashboardMetricsQuery.value
      : {
          subject: null,
          highestAttendanceClass: null,
          highestClassAverage: null,
        };

  const { subject, highestAttendanceClass, highestClassAverage } =
    dashboardMetrics;

  // Get teacher ID from auth context or loader data as fallback
  const teacherId = authTeacherId || loaderData?.teacherId;

  // 🚀 OPTIMAL PATTERN: Read from cache (no network request)
  // The loader already hydrated the cache, so this is instant
  const { isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: queryKeys.teacherStudentCount(teacherId),
    queryFn: () => teacherService.getStudentCount(teacherId),
    initialData: teacherStudentCount,
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 🚀 OPTIMIZED: Use cached activities from loader
  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: queryKeys.recentActivities(teacherId),
    queryFn: () => teacherService.getRecentActivities(teacherId),
    initialData:
      activities?.status === "fulfilled" ? activities.value : undefined,
    enabled: !!teacherId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Memoize welcome message to prevent unnecessary recalculations
  const welcomeMessage = useMemo(() => {
    const displayName =
      currentUser?.username?.charAt(0).toUpperCase() +
        currentUser?.username?.slice(1) ||
      currentUser?.email?.charAt(0).toUpperCase() +
        currentUser?.email?.slice(1);
    return displayName;
  }, [currentUser?.username, currentUser?.email]);

  // Dashboard aggregated metrics (highest class average & attendance)

  // Loading state - should be very brief due to loader
  if (statsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--grey-900)] dark:text-[var(--grey-100)]">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--grey-600)] dark:text-[var(--grey-400)]">
              Loading your dashboard...
            </p>
          </div>
        </div>

        {/* Skeleton loaders */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--grey-900)] dark:text-[var(--grey-100)]">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-red-600">
              Failed to load dashboard data. Please try again.
            </p>
          </div>
        </div>

        {/* Show default stats when API fails */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Total Students", value: "0", icon: FiUsers },
            { title: "Your Classes", value: "0", icon: FiBook },
            { title: "Subjects Teaching", value: "0", icon: FiAward },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-[var(--primary-500)] bg-opacity-10">
                      <Icon
                        size={24}
                        className="text-[var(--primary-600)] dark:text-[var(--primary-400)]"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-[var(--grey-600)] dark:text-[var(--grey-400)]">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-semibold text-[var(--grey-900)] dark:text-[var(--grey-100)]">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Enhanced Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-700 p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {welcomeMessage}!
            </h1>
            <p className="mt-2 text-primary-100 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Teacher Portal • {subject?.name || "Educator"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/app/attendance/mark")}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg transition-all text-sm font-medium border border-white/10"
            >
              <FiCheckCircle className="mr-2" /> Mark Attendance
            </button>
            <button
              onClick={() => navigate("/app/grades/new")}
              className="flex items-center px-4 py-2 bg-white text-primary-600 hover:bg-primary-50 rounded-lg transition-all text-sm font-medium shadow-sm"
            >
              <FiPlus className="mr-2" /> New Grade
            </button>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"></div>
      </div>

      {/* Teacher Student Count Dashboard */}
      <TeacherStudentCountDashboard teacherStudentCount={teacherStudentCount} />

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HighestAverageCard data={highestClassAverage} />
        </div>

        <div className="lg:col-span-1 flex flex-col justify-center space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Active Subject
              </p>
              <h4 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {subject?.name || "General"}
              </h4>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-full">
              <FiBook
                className="text-primary-600 dark:text-primary-400"
                size={24}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <HighestAttendanceCard data={highestAttendanceClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiActivity className="text-primary-600" />
              <h3 className="text-lg font-bold text-[var(--grey-900)] dark:text-[var(--grey-100)]">
                Recent Activities
              </h3>
            </div>
            <button className="text-sm text-primary-600 hover:underline">
              View all
            </button>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              {recentActivities?.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <div
                    key={activity.id || idx}
                    className="flex items-start group"
                  >
                    <div className="relative">
                      <div
                        className={`p-2 rounded-lg ${idx === 0 ? "bg-primary-50 text-primary-600" : "bg-gray-50 text-gray-400"} dark:bg-gray-800 group-hover:bg-primary-100 transition-colors`}
                      >
                        <FiActivity size={18} />
                      </div>
                      {idx !== recentActivities.length - 1 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-100 dark:bg-gray-700"></div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-[var(--grey-900)] dark:text-[var(--grey-100)] group-hover:text-primary-600 transition-colors">
                        {activity.action}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-[var(--grey-500)] dark:text-[var(--grey-400)]">
                        <span className="font-semibold">{activity.user}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-300 group-hover:text-primary-600 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-3 text-gray-400">
                    <FiActivity size={24} />
                  </div>
                  <p className="text-sm text-[var(--grey-500)] dark:text-[var(--grey-400)]">
                    No recent activities to show
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card shadow-sm hover:shadow-md transition-shadow">
          <div className="card-header flex items-center space-x-2">
            <FiTrendingUp className="text-primary-600" />
            <h3 className="text-lg font-bold text-[var(--grey-900)] dark:text-[var(--grey-100)]">
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Add Student",
                  desc: "Register new",
                  icon: FiUsers,
                  color: "blue",
                  path: "/app/students/new",
                },
                {
                  label: "Mark Attendance",
                  desc: "Daily tracker",
                  icon: FiCalendar,
                  color: "green",
                  path: "/app/attendance/mark",
                },
                {
                  label: "Add Grades",
                  desc: "Update records",
                  icon: FiAward,
                  color: "purple",
                  path: "/app/grades/new",
                },
                {
                  label: "Subjects",
                  desc: "Subjects analytics",
                  icon: FiFileText,
                  color: "orange",
                  path: "/app/subjects",
                },
              ].map((action) => {
                const Icon = action.icon;
                const colorMap = {
                  blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
                  green:
                    "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800",
                  purple:
                    "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800",
                  orange:
                    "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800",
                };

                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-primary-500 hover:shadow-md transition-all group"
                  >
                    <div
                      className={`p-4 rounded-2xl mb-4 ${colorMap[action.color]} group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={24} />
                    </div>
                    <p className="font-bold text-sm text-[var(--grey-900)] dark:text-[var(--grey-100)]">
                      {action.label}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--grey-500)] dark:text-[var(--grey-400)] mt-1">
                      {action.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {dashboardMetricsQuery.isLoading && (
        <Loading message="Loading dashboard..." size="large" />
      )}
    </div>
  );
};

export default DashboardPage;
