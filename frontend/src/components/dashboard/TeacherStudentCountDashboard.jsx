import React, { memo } from "react";
import {
  FiUsers,
  FiBookOpen,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth.jsx";

const StatCard = memo(({ title, value, icon: Icon, trend }) => {
  const displayValue = value !== undefined && value !== null ? value : "0";

  return (
    <div
      className="rounded-xl p-6 border transition-all hover:shadow-lg"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        borderColor: "var(--color-border-primary)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {title}
          </p>
          <div className="flex items-center">
            <h3
              className="text-2xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {displayValue}
            </h3>
            {trend && (
              <span
                className={`ml-2 text-sm font-medium ${
                  trend.type === "positive"
                    ? "text-green-600"
                    : trend.type === "negative"
                      ? "text-red-600"
                      : "text-gray-500"
                }`}
                style={{
                  color:
                    trend.type === "positive"
                      ? "var(--color-success)"
                      : trend.type === "negative"
                        ? "var(--color-error)"
                        : "var(--color-text-tertiary)",
                }}
              >
                {trend.value}
              </span>
            )}
          </div>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: "var(--color-interactive-primary)",
            color: "var(--color-text-inverse)",
          }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
});

const ClassBreakdownCard = memo(({ classData }) => {
  return (
    <div
      className="rounded-lg p-4 border transition-all hover:shadow-md"
      style={{
        backgroundColor: "var(--color-background-primary)",
        borderColor: "var(--color-border-primary)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4
            className="font-medium text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            {classData.className}
          </h4>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {classData.subject}
          </p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: "var(--color-interactive-primary)",
            color: "var(--color-text-inverse)",
          }}
        >
          {classData.studentCount} students
        </div>
      </div>
    </div>
  );
});

const TeacherStudentCountDashboard = memo(({ teacherStudentCount }) => {
  // Handle Promise.allSettled result structure and add null checks
  const data =
    teacherStudentCount?.status === "fulfilled"
      ? teacherStudentCount.value
      : null;
  const error =
    teacherStudentCount?.status === "rejected"
      ? teacherStudentCount.reason
      : null;

  // Provide default values if data is undefined
  const {
    totalClasses = 0,
    totalStudents = 0,
    lastUpdated = null,
    classBreakdown = [],
    teacherName = "Teacher",
  } = data || {};

  // Show error state if promise was rejected
  if (error) {
    return (
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: "var(--color-background-secondary)",
          borderColor: "var(--color-error)",
        }}
      >
        <div className="flex items-center space-x-3">
          <FiAlertCircle size={20} style={{ color: "var(--color-error)" }} />
          <div>
            <h3
              className="font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Unable to load dashboard data
            </h3>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Please try refreshing the page or contact support if the issue
              persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents || 0}
          icon={FiUsers}
          trend={{ value: "+12%", type: "positive" }}
        />

        <StatCard
          title="Total Classes"
          value={totalClasses || 0}
          icon={FiBookOpen}
          trend={{ value: "+2", type: "positive" }}
        />

        <StatCard
          title="Last Updated"
          value={
            lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"
          }
          icon={FiClock}
        />
      </div>

      {/* Class Breakdown */}
      {classBreakdown && classBreakdown.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Class Breakdown
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classBreakdown.map((classData) => (
              <ClassBreakdownCard
                key={classData.classId}
                classData={classData}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary Info */}
      {data && (
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--color-background-secondary)",
            borderColor: "var(--color-border-primary)",
          }}
        >
          <h3
            className="font-semibold mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Summary for {teacherName}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            You are currently teaching <strong>{totalStudents}</strong> students
            across <strong>{totalClasses}</strong> classes.
            {totalStudents > 50 && (
              <>
                {" "}
                This represents a significant teaching load. Consider using our
                analytics tools to track student performance effectively.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
});

export default TeacherStudentCountDashboard;
