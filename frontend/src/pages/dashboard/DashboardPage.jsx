import { useLoaderData } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useCallback } from "react";
import {
  FiUsers,
  FiBook,
  FiAward,
  FiCalendar,
  FiActivity,
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--grey-900)] dark:text-[var(--grey-100)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--grey-600)] dark:text-[var(--grey-400)]">
            Welcome back ,{" "}
            <span className="font-bold text-lg text-primary-600 ">
              {welcomeMessage}!
            </span>{" "}
            Teacher Portal
          </p>
        </div>
      </div>
      {/* Teacher Student Count Dashboard */}
      <TeacherStudentCountDashboard teacherStudentCount={teacherStudentCount} />

      {/* Second row: highest average, subject label, highest attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1">
          <HighestAverageCard data={highestClassAverage} />
        </div>

        <div className="flex items-center justify-center">
          <SubjectLabel subject={subject} />
        </div>

        <div className="lg:col-span-1">
          <HighestAttendanceCard data={highestAttendanceClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-[var(--grey-900)] dark:text-[var(--grey-100)]">
              Recent Activities
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities?.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-[var(--grey-100)] dark:bg-[var(--grey-700)] rounded-full">
                      <FiActivity
                        className="text-[var(--grey-600)] dark:text-[var(--grey-400)]"
                        size={16}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--grey-900)] dark:text-[var(--grey-100)]">
                        {activity.action}
                      </p>
                      <p className="text-xs text-[var(--grey-500)] dark:text-[var(--grey-400)]">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--grey-500)] dark:text-[var(--grey-400)]">
                  No recent activities
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-[var(--grey-900)] dark:text-[var(--grey-100)]">
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-left border border-[var(--grey-200)] dark:border-[var(--grey-600)] rounded-lg hover:bg-[var(--grey-50)] dark:hover:bg-[var(--grey-700)] transition-colors">
                <FiUsers
                  className="text-[var(--primary-600)] dark:text-[var(--primary-400)] mb-2"
                  size={24}
                />
                <p className="font-medium text-[var(--grey-900)] dark:text-[var(--grey-100)]">
                  Add Student
                </p>
                <p className="text-xs text-[var(--grey-500)] dark:text-[var(--grey-400)]">
                  Register new student
                </p>
              </button>
              <button className="p-4 text-left border border-[var(--grey-200)] dark:border-[var(--grey-600)] rounded-lg hover:bg-[var(--grey-50)] dark:hover:bg-[var(--grey-700)] transition-colors">
                <FiCalendar
                  className="text-[var(--primary-600)] dark:text-[var(--primary-400)] mb-2"
                  size={24}
                />
                <p className="font-medium text-[var(--grey-900)] dark:text-[var(--grey-100)]">
                  Mark Attendance
                </p>
                <p className="text-xs text-[var(--grey-500)] dark:text-[var(--grey-400)]">
                  Take attendance
                </p>
              </button>
              <button className="p-4 text-left border border-[var(--grey-200)] dark:border-[var(--grey-600)] rounded-lg hover:bg-[var(--grey-50)] dark:hover:bg-[var(--grey-700)] transition-colors">
                <FiAward
                  className="text-[var(--primary-600)] dark:text-[var(--primary-400)] mb-2"
                  size={24}
                />
                <p className="font-medium text-[var(--grey-900)] dark:text-[var(--grey-100)]">
                  Add Grades
                </p>
                <p className="text-xs text-[var(--grey-500)] dark:text-[var(--grey-400)]">
                  Update student grades
                </p>
              </button>
              <button className="p-4 text-left border border-[var(--grey-200)] dark:border-[var(--grey-600)] rounded-lg hover:bg-[var(--grey-50)] dark:hover:bg-[var(--grey-700)] transition-colors">
                <FiBook
                  className="text-[var(--primary-600)] dark:text-[var(--primary-400)] mb-2"
                  size={24}
                />
                <p className="font-medium text-[var(--grey-900)] dark:text-[var(--grey-100)]">
                  Generate Report
                </p>
                <p className="text-xs text-[var(--grey-500)] dark:text-[var(--grey-400)]">
                  View analytics
                </p>
              </button>
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
