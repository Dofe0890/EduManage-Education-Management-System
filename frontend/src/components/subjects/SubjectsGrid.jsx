import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FiBook, FiHash, FiInfo } from "react-icons/fi"; // icons for headers

export default function SubjectsGrid({ subjects = [], loading = false }) {
  const columns = useMemo(
    () => [
      {
        header: (
          <span className="inline-flex items-center gap-1">
            <span>ID</span>
          </span>
        ),
        accessorKey: "id",
        cell: ({ getValue }) => (
          <div
            className="text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            {getValue()}
          </div>
        ),
      },
      {
        header: (
          <span className="inline-flex items-center gap-1">
            <FiBook size={14} />
            <span>Name</span>
          </span>
        ),
        accessorKey: "name",
        cell: ({ getValue }) => (
          <div className="inline-flex items-center gap-2">
            <FiBook
              size={16}
              className="text-[var(--color-interactive-primary)]"
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {getValue()}
            </span>
          </div>
        ),
      },
      {
        header: (
          <span className="inline-flex items-center gap-1">
            <FiInfo size={14} />
            <span>Description</span>
          </span>
        ),
        accessorKey: "description",
        cell: ({ getValue }) => (
          <div
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {getValue() || "-"}
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: subjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor: "var(--color-interactive-primary)",
                      color: "var(--color-text-inverse)",
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            className="divide-y"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors"
                style={{
                  backgroundColor: "var(--color-background-primary)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-background-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-background-primary)")
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 border"
                    style={{ borderColor: "var(--color-border-primary)" }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && subjects.length === 0 && (
        <div className="text-center py-12">
          <p
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            No subjects found
          </p>
        </div>
      )}
    </div>
  );
}
