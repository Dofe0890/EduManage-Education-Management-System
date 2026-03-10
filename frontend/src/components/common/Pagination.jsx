import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Reusable Pagination component.
 * Works with useTableData (or useSearchableData) hook.
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalCount,
  startIndex,
  endIndex,
  onPageChange,
  limit,
  onLimitChange,
  showLimitSelector = true,
  className = "",
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and nearby pages
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (start > 1) {
        if (start > 2) {
          pages.unshift("...");
        }
        pages.unshift(1);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1 && totalCount <= limit) {
    return null; // Don't show pagination if not needed
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Results count */}
      <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Showing {startIndex}-{endIndex} of {totalCount} results
      </div>

      <div className="flex items-center gap-4">
        {/* Limit selector */}
        {showLimitSelector && (
          <div className="flex items-center gap-2">
            <label
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Show:
            </label>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:border-transparent"
              style={{
                borderColor: "var(--color-border-primary)",
                backgroundColor: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
            style={{
              borderColor: "var(--color-border-primary)",
              color: "var(--color-text-primary)",
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor =
                  "var(--color-background-secondary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            <FiChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span
                    className="px-3 py-1 text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageClick(page)}
                    className={`px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      page === currentPage ? "" : ""
                    }`}
                    style={{
                      backgroundColor:
                        page === currentPage
                          ? "var(--color-interactive-primary)"
                          : "transparent",
                      color:
                        page === currentPage
                          ? "var(--color-text-inverse)"
                          : "var(--color-text-primary)",
                      borderColor: "var(--color-border-primary)",
                    }}
                    onMouseEnter={(e) => {
                      if (page !== currentPage) {
                        e.target.style.backgroundColor =
                          "var(--color-background-secondary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page !== currentPage) {
                        e.target.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
            style={{
              borderColor: "var(--color-border-primary)",
              color: "var(--color-text-primary)",
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor =
                  "var(--color-background-secondary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = "transparent";
              }
            }}
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
