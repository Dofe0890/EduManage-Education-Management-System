import React from "react";

const SubjectLabel = ({ subject }) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className="px-4 py-2 rounded-full border"
        style={{
          backgroundColor: "var(--color-background-secondary)",
          borderColor: "var(--color-border-primary)",
        }}
      >
        <span className="text-sm font-medium">
          Subject:{" "}
          <span className=" text-primary-600">{subject?.name || "-"}</span>
        </span>
      </div>
    </div>
  );
};

export default SubjectLabel;
