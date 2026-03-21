import React from "react";
import { FiTrendingUp, FiAward, FiBookOpen } from "react-icons/fi";

const HighestAverageCard = ({ data }) => {
  const metric = data?.highestClassAverage;

  return (
    <div className="card h-full border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br relative overflow-hidden group" style={{
      backgroundColor: "var(--color-surface-primary)",
      backgroundImage: "linear-gradient(to bottom right, var(--color-surface-primary), var(--color-background-secondary))"
    }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: "var(--color-brand-500)", opacity: 0.1 }}></div>
      <div className="card-header border-none pb-0 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: "var(--color-brand-100)" }}>
            <FiTrendingUp
              style={{ color: "var(--color-brand-600)" }}
              size={22}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
              Highest Average
            </h3>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Class Performance</p>
          </div>
        </div>
      </div>
      <div className="card-body pt-5 relative z-10">
        {metric ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl shadow-lg" style={{ background: "linear-gradient(to right, var(--color-brand-500), var(--color-brand-600))" }}>
              <div className="flex items-baseline space-x-1">
                <span className="text-5xl font-extrabold leading-none drop-shadow-sm" style={{ color: "var(--color-white)" }}>
                  {metric.averageGrade?.toFixed(1)}
                </span>
                <span className="text-2xl font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-xl border shadow-sm" style={{ 
              backgroundColor: "var(--color-surface-primary)",
              borderColor: "var(--color-border-primary)"
            }}>
              <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: "#fef3c7" }}>
                <FiAward style={{ color: "#f59e0b" }} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                  {metric.className}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Top Performing Class</p>
              </div>
            </div>
            {metric.subjectName && (
              <div className="flex items-center text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                <FiBookOpen className="mr-1" size={14} />
                <span>{metric.subjectName}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full mb-3" style={{ backgroundColor: "var(--color-background-secondary)" }}>
              <FiTrendingUp style={{ color: "var(--color-text-tertiary)" }} size={28} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              No grades recorded yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
              Grades will appear once students are evaluated
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HighestAverageCard;