import React from "react";

const Loading = ({ message = "Loading...", size = "medium" }) => {
  const sizeConfig = {
    small: {
      container: "w-16 h-16",
      ring: "w-12 h-12",
      dot: "w-2 h-2",
      text: "text-sm",
    },
    medium: {
      container: "w-24 h-24",
      ring: "w-20 h-20",
      dot: "w-3 h-3",
      text: "text-base",
    },
    large: {
      container: "w-32 h-32",
      ring: "w-28 h-28",
      dot: "w-4 h-4",
      text: "text-lg",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        {/* Modern Ring Loader */}
        <div className={`loading-ring-container ${config.container}`}>
          <div className={`loading-ring ${config.ring}`}>
            <div className="ring-segment ring-segment-1"></div>
            <div className="ring-segment ring-segment-2"></div>
            <div className="ring-segment ring-segment-3"></div>
            <div className="ring-segment ring-segment-4"></div>
            <div className="ring-center">
              <div className={`loading-dot ${config.dot}`}></div>
            </div>
          </div>
        </div>

        {/* Loading message with subtle animation */}
        <div className="loading-text">
          <p className={`loading-message ${config.text}`}>{message}</p>
          <div className="loading-dots-indicator">
            <span className="indicator-dot"></span>
            <span className="indicator-dot"></span>
            <span className="indicator-dot"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
