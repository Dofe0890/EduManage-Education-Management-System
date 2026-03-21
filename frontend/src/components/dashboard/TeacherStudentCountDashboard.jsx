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

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {displayValue}
            </h3>
            {trend && (
              <span
                className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  trend.type === "positive"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {trend.type === "positive" ? (
                  <FiTrendingUp className="mr-1" />
                ) : (
                  <FiTrendingDown className="mr-1" />
                )}
                {trend.value}
              </span>
            )}
          </div>
        </div>
        <div
          className={`p-4 rounded-xl transition-transform group-hover:scale-110 ${colorClasses[color] || colorClasses.blue}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
});

const ClassBreakdownCard = memo(({ classData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary-500 dark:hover:border-primary-400 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
          <FiBookOpen className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
        </div>
        <span className="text-xs font-bold px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-lg">
          {classData.studentCount} Students
        </span>
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {classData.className}
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-6 flex items-center space-x-4">
        <div className="p-3 bg-red-100 dark:bg-red-800 rounded-full text-red-600 dark:text-red-300">
          <FiAlertCircle size={24} />
        </div>
        <div>
          <h3 className="font-bold text-red-900 dark:text-red-200">
            Unable to load metrics
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Please refresh the page to try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
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

      {/* Class Breakdown */}
      {classBreakdown && classBreakdown.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Classes
            </h2>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
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

      {/* Summary Insights */}
      {data && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">Teaching Insights</h3>
            <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
              You're currently managing{" "}
              <span className="text-white font-bold">
                {totalStudents} students
              </span>{" "}
              across{" "}
              <span className="text-white font-bold">
                {totalClasses} classes
              </span>
              .
              {totalStudents > 50
                ? " Your workload is high. We recommend focusing on classes with lower attendance to improve overall performance."
                : " Your student-to-class ratio is optimal for personalized instruction."}
            </p>
          </div>
          <FiTrendingUp className="absolute right-[-20px] bottom-[-20px] text-white/5 w-40 h-40" />
        </div>
      )}
    </div>
  );
});

export default TeacherStudentCountDashboard;
