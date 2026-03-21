# Frontend Page Structure & Coding Standards

This document defines the **generic structure, patterns, and rules** for building pages in this EduManage frontend application. All new pages (especially CRUD pages like Students, Teachers, Classes, etc.) should follow these guidelines.

---

## Project Architecture Overview

The frontend uses:

- **React 18+** with functional components and hooks
- **React Router v6** for routing
- **TanStack Table v8** for data tables (via `@tanstack/react-table`)
- **React Query v5** (`@tanstack/react-query`) for server state management
- **React Hook Form** for form handling with validation
- **Tailwind CSS** for utility classes + CSS custom properties for theming
- **SweetAlert2** for confirmation dialogs and notifications

---

## Directory Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── common/           # Generic components (Modal, Button, Input, Pagination, etc.)
│   ├── layout/           # Layout components (Sidebar, Header, Layout)
│   ├── dashboard/       # Dashboard-specific components
│   └── [entity]/         # Entity-specific components (e.g., students/, classes/)
├── pages/                # Route page components
│   ├── [entity]/         # Entity pages (e.g., students/, teachers/)
│   │   ├── [Entity]Page.jsx        # List view (main page)
│   │   ├── Create[Entity].jsx       # Create form
│   │   ├── Edit[Entity].jsx         # Edit form
│   │   └── [Entity]Details.jsx      # Detail view
│   ├── auth/             # Authentication pages
│   ├── reports/         # Report pages
│   └── error/            # Error pages (404, unauthorized)
├── services/             # API service layer
├── hooks/                # Custom hooks
├── contexts/             # React Context providers
├── loaders/              # React Router loaders
├── config/               # App configuration (queryClient, navItems, etc.)
├── styles/               # Global styles and theme
└── utils/                # Utility functions
```

---

## Page Types & File Naming

### Standard CRUD Page Set

For each entity (e.g., Students, Teachers, Classes), create:

| File                 | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `[Entity]Page.jsx`   | Main list view with table, search, filters, pagination |
| `Create[Entity].jsx` | Form page to create new entity                         |
| `Edit[Entity].jsx`   | Form page to edit existing entity (can be modal)       |

### Naming Conventions

- **Pages**: PascalCase (e.g., `StudentsPage.jsx`, `CreateStudent.jsx`)
- **Components**: PascalCase (e.g., `StudentsGrid.jsx`, `EditStudentModal.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useStudents.js`, `useTableData.js`)
- **Services**: camelCase (e.g., `studentService.js`, `teacherService.js`)
- **Contexts**: PascalCase with `Context` suffix (e.g., `StudentContext.jsx`)

---

## Component Architecture

### Page Component Pattern

Each list page should follow this structure:

```jsx
// 1. Imports - organized by type
import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { queryKeys } from "../../config/queryClient";
import { useEntityData } from "../../contexts/EntityContext";
import { useTableData } from "../../hooks/useTableData";
import { entityService } from "../../services/entityService";
import SearchFilter from "../../components/common/SearchFilter";
import Pagination from "../../components/common/Pagination";
import EntityGrid from "../../components/entity/EntityGrid";

// 2. Query param configuration
const QUERY_PARAMS = {
  search: "searchParamName",
  page: "page",
  limit: "limit",
  orderBy: "orderBy",
  isDescending: "isDescending",
};

// 3. Local cache (if needed)
const _entityCache = new Map();

// 4. Data fetch function with normalization
const fetchEntity = async (params) => {
  const obj = Object.fromEntries(params.entries());
  const cacheKey = JSON.stringify(obj);

  if (_entityCache.has(cacheKey)) {
    return _entityCache.get(cacheKey);
  }

  const res = await entityService.getAll(obj);
  const data = res?.data ?? res?.items ?? [];
  const totalCount = res?.totalCount ?? res?.total ?? 0;

  const normalized = { data, totalCount };
  _entityCache.set(cacheKey, normalized);
  return normalized;
};

// 5. Filter configuration
const ENTITY_FILTERS = [
  { name: "status", label: "Status", type: "select", options: [...] },
  { name: "field", label: "Field", type: "number", placeholder: "e.g. 1" },
];

// 6. Sort options
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "Name", label: "Name" },
  { value: "CreatedAt", label: "Created At" },
];

// 7. Main component
const EntityPage = () => {
  // Context for global state
  const { setEntityData } = useEntityData();

  // Table data hook
  const table = useTableData({
    fetchData: fetchEntity,
    queryKeyPrefix: queryKeys.entityListPrefix,
    initialPage: 1,
    initialLimit: 10,
    initialOrderBy: "",
    initialIsDescending: false,
    onSuccess: useCallback((data, totalCount) => {
      setEntityData(data, totalCount);
    }, [setEntityData]),
    enabled: true,
  });

  // Reset handler
  const handleReset = useCallback(() => {
    table.reset();
  }, [table]);

  // Memoized skeleton rows
  const skeletonRows = useMemo(() => [...Array(5)], []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Entity Name
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Description
          </p>
        </div>
        <Link to="new" className="...">
          + Add Entity
        </Link>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        searchPlaceholder="Search by..."
        searchParamName={QUERY_PARAMS.search}
        filters={ENTITY_FILTERS}
        onSearch={table.handleSearch}
        onReset={handleReset}
        debounceMs={300}
        sortOptions={SORT_OPTIONS}
        orderBy={table.orderBy}
        isDescending={table.isDescending}
        onSortChange={table.handleSortChange}
      />

      {/* Error Banner */}
      {table.error && (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{...}} role="alert">
          {table.error}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border shadow-sm overflow-hidden" style={{...}}>
        <div className="p-4 sm:p-6">
          {table.loading ? (
            <div className="space-y-4">
              {skeletonRows.map((_, i) => (
                <div key={i} className="h-12 rounded-lg animate-pulse" style={{...}} />
              ))}
            </div>
          ) : (
            <EntityGrid data={table.data} loading={table.loading} />
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t" style={{...}}>
          <Pagination
            currentPage={table.paginationInfo.currentPage}
            totalPages={table.paginationInfo.totalPages}
            totalCount={table.totalCount}
            startIndex={table.paginationInfo.startIndex}
            endIndex={table.paginationInfo.endIndex}
            onPageChange={table.handlePageChange}
            limit={table.limit}
            onLimitChange={table.handleLimitChange}
            showLimitSelector
          />
        </div>
      </div>
    </div>
  );
};

export default EntityPage;
```

### Form Page Pattern (Create/Edit)

```jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEntityContext } from "../../contexts/EntityContext";
import { entityService } from "../../services/entityService";

const CreateEntity = () => {
  const navigate = useNavigate();
  const { addEntity } = useEntityContext();
  const [formData, setFormData] = useState({/* initial fields */});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // Add validation logic
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const submissionData = {/* format data */};
      const newEntity = await entityService.create(submissionData);
      addEntity(newEntity);
      navigate("/app/entities");
    } catch (error) {
      setErrors({ submit: "Failed to create entity." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/app/entities");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Create Entity
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Add a new entity to the system
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-2xl shadow-sm border p-6" style={{...}}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && <div className="p-4 border rounded-lg" style={{...}}>{errors.submit}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Fields */}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{...}}>
            <button type="button" onClick={handleCancel} className="..." disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="..." disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Entity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEntity;
```

---

## Styling Guidelines

### CSS Custom Properties (Theming)

Always use CSS variables for theming instead of hardcoded colors:

```jsx
// DO: Use CSS variables
style={{
  color: "var(--color-text-primary)",
  backgroundColor: "var(--color-surface-primary)",
  borderColor: "var(--color-border-primary)",
}}

// DON'T: Use hardcoded colors
style={{ color: "#000" }}
```

### Available CSS Variables

| Variable                       | Usage                    |
| ------------------------------ | ------------------------ |
| `--color-text-primary`         | Main text color          |
| `--color-text-secondary`       | Secondary/subtitle text  |
| `--color-text-tertiary`        | Muted/placeholder text   |
| `--color-text-inverse`         | Text on dark backgrounds |
| `--color-surface-primary`      | Card/panel background    |
| `--color-background-primary`   | Main background          |
| `--color-background-secondary` | Secondary background     |
| `--color-background-tertiary`  | Hover states             |
| `--color-border-primary`       | Border color             |
| `--color-interactive-primary`  | Primary action color     |
| `--color-error`                | Error color              |
| `--color-error-light`          | Error background         |

### Class Names & Tailwind

- Use Tailwind utility classes for layout/spacing
- Use CSS variables via `style` prop for colors
- Use semantic class names for complex styles when needed

---

## State Management

### Context Pattern

Use React Context for global UI state management:

```jsx
// contexts/EntityContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const EntityContext = createContext(null);

export const EntityProvider = ({ children }) => {
  const [entities, setEntities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const setEntityData = useCallback((data, count) => {
    setEntities(data);
    setTotalCount(count);
  }, []);

  const addEntity = useCallback((entity) => {
    setEntities((prev) => [entity, ...prev]);
  }, []);

  const removeEntity = useCallback((id) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntity = useCallback((id, updated) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e)),
    );
  }, []);

  return (
    <EntityContext.Provider
      value={{
        entities,
        totalCount,
        setEntityData,
        addEntity,
        removeEntity,
        updateEntity,
      }}
    >
      {children}
    </EntityContext.Provider>
  );
};

export const useEntityContext = () => {
  const context = useContext(EntityContext);
  if (!context)
    throw new Error("useEntityContext must be used within EntityProvider");
  return context;
};

// For optimized consumption (prevents re-renders)
export const useEntityData = () => {
  const { setEntityData } = useEntityContext();
  return { setEntityData };
};
```

### When to Use Context vs Local State

- **Context**: Global data needed by multiple components (entity list, user info)
- **Local State**: UI-only state specific to one component (modal open/close, form inputs)

---

## API Integration

### Service Layer Pattern

```jsx
// services/entityService.js
import axios from "./axios";

export const entityService = {
  getAll: (params) => axios.get("/entities", { params }),
  getById: (id) => axios.get(`/entities/${id}`),
  create: (data) => axios.post("/entities", data),
  update: (id, data) => axios.put(`/entities/${id}`, data),
  delete: (id) => axios.delete(`/entities/${id}`),
};
```

### Data Normalization

Always normalize API responses in the fetch function:

```jsx
const fetchEntity = async (params) => {
  const res = await entityService.getAll(params);
  let data = [];
  let totalCount = 0;

  if (Array.isArray(res)) {
    data = res;
    totalCount = res.length;
  } else {
    data = res?.data ?? res?.items ?? [];
    totalCount = res?.totalCount ?? res?.total ?? res?.count ?? 0;
  }

  return { data, totalCount };
};
```

---

## Performance Optimizations

### Memoization

Use `useMemo` and `useCallback` appropriately:

```jsx
// Memoize expensive calculations
const initialsById = useMemo(() => {
  const map = new Map();
  for (const item of data || []) {
    const initials = item.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    map.set(item.id, initials);
  }
  return map;
}, [data]);

// Memoize handlers
const handleEdit = useCallback((item) => {
  setEditingItem(item);
  setIsEditModalOpen(true);
}, []);
```

### Lazy Loading

Lazy load modals and heavy components:

```jsx
import { lazy, Suspense } from "react";

const EditEntityModal = lazy(() => import("./EditEntityModal"));

// Use with Suspense
<Suspense fallback={null}>
  <EditEntityModal isOpen={isOpen} onClose={handleClose} />
</Suspense>;
```

### React.memo

Wrap presentation components with React.memo:

```jsx
export default React.memo(EntityGridComponent, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data && prevProps.loading === nextProps.loading
  );
});
```

### Local Cache for Deduplication

```jsx
const _entityCache = new Map();

const fetchEntity = async (params) => {
  const obj = Object.fromEntries(params.entries());
  const cacheKey = JSON.stringify(obj);

  if (_entityCache.has(cacheKey)) {
    return _entityCache.get(cacheKey);
  }

  const res = await entityService.getAll(obj);
  _entityCache.set(cacheKey, { data: res.data, totalCount: res.totalCount });
  return _entityCache.get(cacheKey);
};
```

---

## Code Organization Rules

### Import Order

Always organize imports in this order:

1. **React/Router** - `react`, `react-router-dom`
2. **Libraries** - `@tanstack/*`, `react-hook-form`, `sweetalert2`, etc.
3. **Context/Hooks** - Local contexts and custom hooks
4. **Services** - API services
5. **Components** - Reusable components (common first, then specific)
6. **Utils** - Utility functions

```jsx
// 1. React/Router
import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

// 2. Libraries
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

// 3. Context/Hooks
import { useStudentData } from "../../contexts/StudentContext";
import { useTableData } from "../../hooks/useTableData";

// 4. Services
import { studentService } from "../../services/studentService";

// 5. Components
import SearchFilter from "../../components/common/SearchFilter";
import Pagination from "../../components/common/Pagination";
import StudentsGrid from "../../components/students/StudentsGrid";

// 6. Utils
import { formatDate, normalizeStatus } from "../../utils/someUtils";
```

### Component File Structure

Each component file should have:

1. **Imports** - Top of file, organized by type
2. **Utility functions** - Outside component (for performance)
3. **Component definition** - Main component
4. **Props validation** - If needed (via JSDoc or TypeScript)
5. **Export** - At the end

### Constants Configuration

Extract configuration to the top of the file:

```jsx
const QUERY_PARAMS = { ... };
const ENTITY_FILTERS = [ ... ];
const SORT_OPTIONS = [ ... ];
```

### Comments

- Add **optimization comments** when implementing performance improvements
- Document **query param names** matching backend DTOs
- Use **JSDoc** for complex functions

---

## Component Reference

### Common Components

| Component            | Location                                   | Purpose                           |
| -------------------- | ------------------------------------------ | --------------------------------- |
| `SearchFilter`       | `components/common/SearchFilter.jsx`       | Search + filter bar with debounce |
| `Pagination`         | `components/common/Pagination.jsx`         | Table pagination                  |
| `Modal`              | `components/common/Modal.jsx`              | Base modal                        |
| `Button`             | `components/common/Button.jsx`             | Styled button                     |
| `Input`              | `components/common/Input.jsx`              | Form input                        |
| `FormRow`            | `components/common/FormRow.jsx`            | Form row wrapper                  |
| `FormRowSelect`      | `components/common/FormRowSelect.jsx`      | Form select                       |
| `Loading`            | `components/common/Loading.jsx`            | Loading spinner                   |
| `RouteErrorBoundary` | `components/common/RouteErrorBoundary.jsx` | Error boundary                    |

### Context Reference

| Context          | Location                      | Purpose               |
| ---------------- | ----------------------------- | --------------------- |
| `AuthContext`    | `contexts/AuthContext.jsx`    | Authentication state  |
| `StudentContext` | `contexts/StudentContext.jsx` | Student global state  |
| `AppContext`     | `contexts/AppContext.jsx`     | App-wide global state |
