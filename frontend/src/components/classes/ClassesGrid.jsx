import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useAuth } from "../../hooks/useAuth";

import { FiUserPlus, FiCheckCircle } from "react-icons/fi";
import AssignClassModal from "./AssignClassModal";

export default function ClassesGrid({ data, loading }) {
  const classrooms = data ?? [];
  const { teacherId, user } = useAuth();
  const [assignModal, setAssignModal] = useState({
    open: false,
    classroom: null,
  });

  // Get current teacher from auth context
  const getCurrentTeacher = () => {
    if (user && teacherId) {
      return {
        id: teacherId,
        fullName: user.fullName || user.name || `Teacher ${teacherId}`,
        name: user.name || `Teacher ${teacherId}`,
      };
    }
    return null;
  };

  const currentTeacher = useMemo(() => getCurrentTeacher(), []);

  const columns = useMemo(
    () => [
      {
        header: "ID",
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
        header: "Class name",
        accessorKey: "name",
        cell: ({ getValue }) => (
          <div
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            {getValue()}
          </div>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => {
          return (
            <button
              type="button"
              onClick={() =>
                setAssignModal({ open: true, classroom: row.original })
              }
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors `}
              style={{
                backgroundColor: "var(--color-interactive-primary)",
                color: "var(--color-text-inverse)",
              }}
            >
              <>
                <FiUserPlus size={16} />
                Assign
              </>
            </button>
          );
        },
      },
    ],
    [currentTeacher],
  );

  const table = useReactTable({
    data: classrooms,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAssignSuccess = () => {
    setAssignModal({ open: false, classroom: null });
    // Data is automatically refreshed via the useAssignTeacher hook
  };

  return (
    <>
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
                        backgroundColor: "var(--color-background-secondary)",
                        color: "var(--color-text-secondary)",
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
                  style={{ backgroundColor: "var(--color-background-primary)" }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor =
                      "var(--color-background-secondary)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor =
                      "var(--color-background-primary)")
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 border"
                      style={{ borderColor: "var(--color-border-primary)" }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && classrooms.length === 0 && (
          <div className="text-center py-12">
            <p
              className="text-sm"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              No classes found
            </p>
          </div>
        )}
      </div>
      <AssignClassModal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, classroom: null })}
        classroom={assignModal.classroom}
        onSuccess={handleAssignSuccess}
      />
    </>
  );
}
