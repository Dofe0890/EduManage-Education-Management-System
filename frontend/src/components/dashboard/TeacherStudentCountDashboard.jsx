import React, { memo } from "react";
import {
  FiUsers,
  FiBookOpen,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";

const StatCard = memo(({ title, value, icon: Icon, trend, color }) => {
  const displayValue = value !== undefined && value !== null ? value : "0";

  const colorStyles = {
    blue: { bg: "#eff6ff", text: "#3b82f6" },
    indigo: { bg: "#eef2ff", text: "#6366f1" },
    amber: { bg: "#fffbeb", text: "#f59e0b" },
  };

  const colors = colorStyles[color] || colorStyles.blue;

  return (
    <div className="rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all group" style={{ 
      backgroundColor: "var(--color-surface-primary)",
      borderColor: "var(--color-border-primary)"
    }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-secondary)" }}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {displayValue}
            </h3>
            {trend && (
              <span
                className="flex items-center text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: trend.type === "positive" ? "var(--color-success-light)" : "var(--color-error-light)",
                  color: trend.type === "positive" ? "var(--color-success)" : "var(--color-error)"
                }}
              >
                {trend.type === "positive" ? (
                  <FiTrendingUp className="mr-1" size={12} />
                ) : (
                  <FiTrendingDown className="mr-1" size={12} />
                )}
                {trend.value}
              </span>
            )}
          </div>
        </div>
        <div
          className="p-4 rounded-xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
});

const ClassBreakdownCard = memo(({ classData }) => {
  return (
    <div className="rounded-xl p-5 border shadow-sm hover:shadow-md transition-all group" style={{ 
      backgroundColor: "var(--color-surface-primary)",
      borderColor: "var(--color-border-primary)"
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg transition-colors" style={{ backgroundColor: "var(--color-background-secondary)" }}>
          <FiBookOpen style={{ color: "var(--color-text-tertiary)" }} />
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ 
          backgroundColor: "var(--color-interactive-primary)", 
          color: "white" 
        }}>
          {classData.studentCount} Students
        </span>
      </div>
      <h4 className="font-bold transition-colors" style={{ color: "var(--color-text-primary)" }}>
        {classData.className}
      </h4>
      <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
        {classData.subject}
      </p>
    </div>
  );
});

const TeacherStudentCountDashboard = memo(({ teacherStudentCount }) => {
  const data =
    teacherStudentCount?.status === "fulfilled"
      ? teacherStudentCount.value
      : null;
  const error =
    teacherStudentCount?.status === "rejected"
      ? teacherStudentCount.reason
      : null;

  const {
    totalClasses = 0,
    totalStudents = 0,
    lastUpdated = null,
    classBreakdown = [],
    teacherName = "Teacher",
  } = data || {};

  if (error) {
    return (
      <div className="rounded-2xl p-6 flex items-center space-x-4" style={{ 
        backgroundColor: "var(--color-error-light)",
        borderColor: "var(--color-error)"
      }}>
        <div className="p-3 rounded-full" style={{ backgroundColor: "var(--color-error)", color: "white" }}>
          <FiAlertCircle size={24} />
        </div>
        <div>
          <h3 className="font-bold" style={{ color: "var(--color-error)" }}>
            Unable to load metrics
          </h3>
          <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>
            Please refresh the page to try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={FiUsers}
          trend={{ value: "+12%", type: "positive" }}
          color="blue"
        />
        <StatCard
          title="Total Classes"
          value={totalClasses}
          icon={FiBookOpen}
          trend={{ value: "+2", type: "positive" }}
          color="indigo"
        />
        <StatCard
          title="Last Updated"
          value={
            lastUpdated
              ? new Date(lastUpdated).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now"
          }
          icon={FiClock}
          color="amber"
        />
      </div>

      {classBreakdown && classBreakdown.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              My Classes
            </h2>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
              {classBreakdown.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {classBreakdown.map((classData) => (
              <ClassBreakdownCard
                key={classData.classId}
                classData={classData}
              />
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className="rounded-2xl p-6 shadow-lg overflow-hidden relative" style={{ background: "linear-gradient(to bottom right, var(--color-neutral-800), var(--color-neutral-900))" }}>
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2" style={{ color: "white" }}>Teaching Insights</h3>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.8)" }}>
              You're currently managing{" "}
              <span style={{ color: "white", fontWeight: "bold" }}>
                {totalStudents} students
              </span>{" "}
              across{" "}
              <span style={{ color: "white", fontWeight: "bold" }}>
                {totalClasses} classes
              </span>
              .
              {totalStudents > 50
                ? " Your workload is high. We recommend focusing on classes with lower attendance to improve overall performance."
                : " Your student-to-class ratio is optimal for personalized instruction."}
            </p>
          </div>
          <FiTrendingUp className="absolute right-[-20px] bottom-[-20px]" style={{ color: "rgba(255,255,255,0.05)", width: 160, height: 160 }} />
        </div>
      )}
    </div>
  );
});

export default TeacherStudentCountDashboard;