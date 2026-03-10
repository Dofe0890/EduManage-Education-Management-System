import React, { useState, useCallback } from "react";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback";
import { FiSearch, FiSliders } from "react-icons/fi";

/**
 * Reusable Search + Filter bar for table pages.
 * Emits URLSearchParams to onSearch (debounced for search input).
 * Use with useTableData: pass handleSearch and build params from local state.
 *
 * @param {string} searchPlaceholder - Placeholder for search input
 * @param {string} searchParamName - Query param name for search (e.g. "name")
 * @param {Array<{ name: string, label: string, type: 'select'|'text'|'number'|'date', options?: Array<{value: string, label: string}>, placeholder?: string }>} filters - Table-specific filters
 * @param {(params: URLSearchParams) => void} onSearch
 * @param {() => void} onReset
 * @param {number} [debounceMs=300]
 * @param {Array<{ value: string, label: string }>} [sortOptions] - For orderBy dropdown
 * @param {string} [orderBy]
 * @param {boolean} [isDescending]
 * @param {(orderBy: string, isDescending: boolean) => void} [onSortChange]
 * @param {boolean} [collapsibleAdvanced=false] - Wrap filters (excluding search) in collapsible section
 * @param {string} [className]
 */
const SearchFilter = ({
  searchPlaceholder = "Search…",
  searchParamName = "search",
  filters = [],
  onSearch,
  onReset,
  debounceMs = 300,
  sortOptions = [],
  orderBy = "",
  isDescending = false,
  onSortChange,
  collapsibleAdvanced = false,
  className = "",
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(filters.map((f) => [f.name, ""])),
  );
  const [advancedOpen, setAdvancedOpen] = useState(!collapsibleAdvanced);

  const buildParams = useCallback(
    (overrides = {}) => {
      const params = new URLSearchParams();
      const search =
        overrides.searchValue !== undefined
          ? overrides.searchValue
          : searchValue;
      if (String(search).trim())
        params.set(searchParamName, String(search).trim());
      const fv =
        overrides.filterValues !== undefined
          ? overrides.filterValues
          : filterValues;
      filters.forEach((f) => {
        const v = fv[f.name];
        if (v != null && String(v).trim() !== "")
          params.set(f.name, String(v).trim());
      });
      return params;
    },
    [searchParamName, searchValue, filters, filterValues],
  );

  const emitSearch = useCallback(
    (overrides) => {
      onSearch(buildParams(overrides));
    },
    [onSearch, buildParams],
  );

  const debouncedEmit = useDebouncedCallback(() => emitSearch(), debounceMs);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearchValue(v);
    debouncedEmit();
  };

  const handleFilterChange = (name, value) => {
    const next = { ...filterValues, [name]: value };
    setFilterValues(next);
    emitSearch({ filterValues: next });
  };

  const handleFilterBlurOrChange = () => {
    emitSearch();
  };

  const handleReset = () => {
    setSearchValue("");
    setFilterValues(Object.fromEntries(filters.map((f) => [f.name, ""])));
    onReset?.();
    onSearch(new URLSearchParams());
  };

  const hasSort = sortOptions.length > 0 && onSortChange;

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border p-4 ${className}`}
      style={{
        borderColor: "var(--color-border-primary)",
        backgroundColor: "var(--color-background-secondary)",
      }}
      role="search"
      aria-label="Table search and filters"
    >
      <div className="flex flex-wrap items-end gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: "var(--color-text-tertiary)" }}
            aria-hidden
          />
          <input
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0"
            style={{
              borderColor: "var(--color-border-primary)",
              color: "var(--color-text-primary)",
              backgroundColor: "var(--color-background-primary)",
            }}
            aria-label={searchPlaceholder}
          />
        </div>

        {/* Inline filters (or trigger for advanced) */}
        {!collapsibleAdvanced && (
          <>
            {filters.map((f) => (
              <FilterField
                key={f.name}
                filter={f}
                value={filterValues[f.name] ?? ""}
                onChange={(v) => handleFilterChange(f.name, v)}
                onCommit={handleFilterBlurOrChange}
              />
            ))}
            {hasSort && (
              <SortControls
                sortOptions={sortOptions}
                orderBy={orderBy}
                isDescending={isDescending}
                onSortChange={onSortChange}
              />
            )}
          </>
        )}

        {collapsibleAdvanced && (
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
            style={{
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-background-primary)",
              borderColor: "var(--color-border-primary)",
            }}
            aria-expanded={advancedOpen}
          >
            <FiSliders className="h-4 w-4" />
            {advancedOpen ? "Hide filters" : "Show filters"}
          </button>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
          style={{
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-background-primary)",
            borderColor: "var(--color-border-primary)",
          }}
        >
          Reset
        </button>
      </div>

      {collapsibleAdvanced && advancedOpen && (
        <div
          className="flex flex-wrap items-end gap-3 pt-2"
          style={{ borderTopColor: "var(--color-border-primary)" }}
        >
          {filters.map((f) => (
            <FilterField
              key={f.name}
              filter={f}
              value={filterValues[f.name] ?? ""}
              onChange={(v) => handleFilterChange(f.name, v)}
              onCommit={handleFilterBlurOrChange}
            />
          ))}
          {hasSort && (
            <SortControls
              sortOptions={sortOptions}
              orderBy={orderBy}
              isDescending={isDescending}
              onSortChange={onSortChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

function FilterField({ filter, value, onChange, onCommit }) {
  const { name, label, type, options = [], placeholder } = filter;

  if (type === "select") {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={name}
          className="text-xs font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {label}
        </label>
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onCommit();
          }}
          className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 min-w-[120px]"
          style={{
            borderColor: "var(--color-border-primary)",
            color: "var(--color-text-primary)",
            backgroundColor: "var(--color-background-primary)",
          }}
          aria-label={label}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const inputType =
    type === "number" ? "number" : type === "date" ? "date" : "text";
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium text-gray-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        placeholder={placeholder}
        className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 min-w-[120px]"
        style={{
          borderColor: "var(--color-border-primary)",
          color: "var(--color-text-primary)",
          backgroundColor: "var(--color-background-primary)",
        }}
        aria-label={label}
      />
    </div>
  );
}

function SortControls({ sortOptions, orderBy, isDescending, onSortChange }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Sort by
        </span>
        <select
          value={orderBy}
          onChange={(e) => onSortChange(e.target.value, isDescending)}
          className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 min-w-[120px]"
          style={{
            borderColor: "var(--color-border-primary)",
            color: "var(--color-text-primary)",
            backgroundColor: "var(--color-background-primary)",
          }}
          aria-label="Sort by"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <label
        className="flex items-center gap-2 py-2 text-sm cursor-pointer"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <input
          type="checkbox"
          checked={isDescending}
          onChange={(e) => onSortChange(orderBy, e.target.checked)}
          className="rounded focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--color-border-primary)",
            backgroundColor: "var(--color-background-primary)",
          }}
        />
        Descending
      </label>
    </div>
  );
}

export default SearchFilter;
