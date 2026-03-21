import React from "react";
import { FiTrendingUp, FiAward } from "react-icons/fi";

const HighestAverageCard = ({ data }) => {
  const metric = data?.highestClassAverage;

  return (
    <div className="card h-full border-none shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800/50">
      <div className="card-header border-none pb-0">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FiTrendingUp
              className="text-blue-600 dark:text-blue-400"
              size={20}
            />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Highest Average
          </h3>
        </div>
      </div>
      <div className="card-body pt-4">
        {metric ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white leading-none">
                  {metric.averageGrade?.toFixed(1)}
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center p-3 bg-white dark:bg-gray-700/50 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
              <FiAward
                className="text-amber-500 mr-2 flex-shrink-0"
                size={18}
              />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {metric.className}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="text-sm text-gray-400 italic">
              No grades recorded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HighestAverageCard;
