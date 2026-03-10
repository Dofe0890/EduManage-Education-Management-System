import React from "react";

const HighestAverageCard = ({ data }) => {
  const metric = data?.highestClassAverage;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium">
          Highest Average Grade Across Your Classes
        </h3>
      </div>
      <div className="card-body">
        {metric ? (
          <div>
            <p className="text-3xl font-bold">
              {metric.averageGrade?.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Class: {metric.className}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No grades available.</p>
        )}
      </div>
    </div>
  );
};

export default HighestAverageCard;
