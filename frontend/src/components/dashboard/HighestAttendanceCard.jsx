import React from "react";

const HighestAttendanceCard = ({ data }) => {
  const metric = data?.highestAttendanceClass;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium">Class with Highest Attendance</h3>
      </div>
      <div className="card-body">
        {metric ? (
          <div>
            <p className="text-3xl font-bold">
              {metric.attendancePercentage?.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Class: {metric.className}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No attendance records.</p>
        )}
      </div>
    </div>
  );
};

export default HighestAttendanceCard;
