import React from "react";
import { FiBookOpen, FiTarget, FiClock } from "react-icons/fi";

const SubjectLabel = ({ subject }) => {
  if (!subject) {
    return (
      <div className="card h-full border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br relative overflow-hidden group" style={{
        backgroundColor: "var(--color-surface-primary)",
        backgroundImage: "linear-gradient(to bottom right, var(--color-surface-primary), var(--color-background-secondary))"
      }}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: "var(--color-brand-500)", opacity: 0.1 }}></div>
        <div className="card-header border-none pb-0 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: "var(--color-brand-100)" }}>
              <FiBookOpen style={{ color: "var(--color-brand-600)" }} size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                Active Subject
              </h3>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Current Teaching</p>
            </div>
          </div>
        </div>
        <div className="card-body pt-5 relative z-10">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-4 rounded-full mb-3" style={{ backgroundColor: "var(--color-background-secondary)" }}>
              <FiBookOpen style={{ color: "var(--color-text-tertiary)" }} size={28} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>No subject assigned</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Assign a subject to start teaching</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br relative overflow-hidden group" style={{
      backgroundColor: "var(--color-surface-primary)",
      backgroundImage: "linear-gradient(to bottom right, var(--color-surface-primary), var(--color-background-secondary))"
    }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: "var(--color-brand-500)", opacity: 0.1 }}></div>
      <div className="card-header border-none pb-0 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: "var(--color-brand-100)" }}>
            <FiBookOpen style={{ color: "var(--color-brand-600)" }} size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
              Active Subject
            </h3>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Current Teaching</p>
          </div>
        </div>
      </div>
      <div className="card-body pt-5 relative z-10">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl shadow-lg" style={{ background: "linear-gradient(to right, var(--color-brand-500), var(--color-brand-600))" }}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <FiTarget className="text-white" size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-white truncate">{subject.name}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Active Subject</p>
              </div>
            </div>
          </div>
          {subject.code && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center" style={{ color: "var(--color-text-secondary)" }}>
                <FiBookOpen className="mr-1" size={14} />
                <span>{subject.code}</span>
              </div>
              {subject.hoursPerWeek && (
                <div className="flex items-center" style={{ color: "var(--color-text-secondary)" }}>
                  <FiClock className="mr-1" size={14} />
                  <span>{subject.hoursPerWeek} hrs/week</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectLabel;