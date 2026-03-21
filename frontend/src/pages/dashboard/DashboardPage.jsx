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

  const teacherId = authTeacherId || loaderData?.teacherId;

  const { isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: queryKeys.teacherStudentCount(teacherId),
    queryFn: () => teacherService.getStudentCount(teacherId),
    initialData: teacherStudentCount,
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: queryKeys.recentActivities(teacherId),
    queryFn: () => teacherService.getRecentActivities(teacherId),
    initialData:
      activities?.status === "fulfilled" ? activities.value : undefined,
    enabled: !!teacherId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const welcomeMessage = useMemo(() => {
    const displayName =
      currentUser?.username?.charAt(0).toUpperCase() +
        currentUser?.username?.slice(1) ||
      currentUser?.email?.charAt(0).toUpperCase() +
        currentUser?.email?.slice(1);
    return displayName;
  }, [currentUser?.username, currentUser?.email]);

  if (statsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              Dashboard
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Loading your dashboard...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-background-secondary)" }}>
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: "var(--color-border-primary)" }}></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: "var(--color-background-secondary)" }}></div>
                    <div className="h-6 rounded w-1/2" style={{ backgroundColor: "var(--color-background-secondary)" }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              Dashboard
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-error)" }}>
              Failed to load dashboard data. Please try again.
            </p>
          </div>
        </div>
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
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-interactive-primary)", opacity: 0.1 }}>
                      <Icon
                        size={24}
                        style={{ color: "var(--color-interactive-primary)" }}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        {stat.title}
                      </p>
                      <p className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
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
      <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-lg" style={{ background: "linear-gradient(to right, var(--color-interactive-primary), #4f46e5)" }}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {welcomeMessage}!
            </h1>
            <p className="mt-2 flex items-center" style={{ color: "rgba(255,255,255,0.8)" }}>
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Teacher Portal • {subject?.name || "Educator"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/app/attendance/mark")}
              className="flex items-center px-4 py-2 rounded-lg transition-all text-sm font-medium border"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.2)", color: "white" }}
            >
              <FiCheckCircle className="mr-2" /> Mark Attendance
            </button>
            <button
              onClick={() => navigate("/app/grades/new")}
              className="flex items-center px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-sm"
              style={{ backgroundColor: "white", color: "var(--color-interactive-primary)" }}
            >
              <FiPlus className="mr-2" /> New Grade
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full" style={{ backgroundColor: "rgba(99,102,241,0.2)" }}></div>
      </div>

      <TeacherStudentCountDashboard teacherStudentCount={teacherStudentCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HighestAverageCard data={{ highestClassAverage }} />
        </div>
        <div className="lg:col-span-1">
          <SubjectLabel subject={subject} />
        </div>
        <div className="lg:col-span-1">
          <HighestAttendanceCard data={{ highestAttendanceClass }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-primary)" }}>
          <div className="card-header flex items-center justify-between" style={{ borderColor: "var(--color-border-primary)" }}>
            <div className="flex items-center space-x-2">
              <FiActivity style={{ color: "var(--color-interactive-primary)" }} />
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                Recent Activities
              </h3>
            </div>
            <button className="text-sm" style={{ color: "var(--color-interactive-primary)" }}>
              View all
            </button>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              {recentActivities?.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <div key={activity.id || idx} className="flex items-start group">
                    <div className="relative">
                      <div
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: idx === 0 ? "rgba(59, 130, 246, 0.1)" : "var(--color-background-secondary)",
                          color: idx === 0 ? "var(--color-interactive-primary)" : "var(--color-text-tertiary)"
                        }}
                      >
                        <FiActivity size={18} />
                      </div>
                      {idx !== recentActivities.length - 1 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6" style={{ backgroundColor: "var(--color-border-secondary)" }}></div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {activity.action}
                      </p>
                      <div className="mt-1 flex items-center text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        <span className="font-semibold">{activity.user}</span>
                        <span className="mx-2" style={{ color: "var(--color-border-primary)" }}>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <FiChevronRight style={{ color: "var(--color-border-primary)" }} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex p-4 rounded-full mb-3" style={{ backgroundColor: "var(--color-background-secondary)", color: "var(--color-text-tertiary)" }}>
                    <FiActivity size={24} />
                  </div>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    No recent activities to show
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: "var(--color-surface-primary)", borderColor: "var(--color-border-primary)" }}>
          <div className="card-header flex items-center space-x-2" style={{ borderColor: "var(--color-border-primary)" }}>
            <FiTrendingUp style={{ color: "var(--color-interactive-primary)" }} />
            <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Add Student", desc: "Register new", icon: FiUsers, color: "blue", path: "/app/students/new" },
                { label: "Mark Attendance", desc: "Daily tracker", icon: FiCalendar, color: "green", path: "/app/attendance/mark" },
                { label: "Add Grades", desc: "Update records", icon: FiAward, color: "purple", path: "/app/grades/new" },
                { label: "Subjects", desc: "Subjects analytics", icon: FiFileText, color: "orange", path: "/app/subjects" },
              ].map((action) => {
                const Icon = action.icon;
                const colorMap = {
                  blue: { bg: "#eff6ff", text: "#3b82f6", border: "#dbeafe" },
                  green: { bg: "#f0fdf4", text: "#22c55e", border: "#dcfce7" },
                  purple: { bg: "#faf5ff", text: "#a855f7", border: "#f3e8ff" },
                  orange: { bg: "#fff7ed", text: "#f97316", border: "#ffedd5" },
                };
                const colors = colorMap[action.color];

                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center justify-center p-6 rounded-xl hover:shadow-md transition-all group"
                    style={{ 
                      backgroundColor: "var(--color-surface-primary)",
                      borderColor: "var(--color-border-primary)"
                    }}
                  >
                    <div
                      className="p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      <Icon size={24} />
                    </div>
                    <p className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>
                      {action.label}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                      {action.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {dashboardMetricsQuery.isLoading && (
        <Loading message="Loading dashboard..." size="large" />
      )}
    </div>
  );
};

export default DashboardPage;