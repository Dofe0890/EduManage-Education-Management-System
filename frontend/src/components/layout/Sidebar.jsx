import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth.jsx";
import navItems from "../../config/navItems";
import { FiBook } from "react-icons/fi";
const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isUser } = useAuth();
  const location = useLocation();

  const filteredNavigation = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some(
      (role) => user?.role === role || user?.roles?.includes(role),
    );
  });

  const isActiveRoute = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? "true" : undefined}
        aria-hidden={!isOpen}
        className={`
        fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className="flex items-center justify-between h-16 px-6 border-b"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--color-interactive-primary)" }}
              >
                <FiBook
                  style={{ color: "var(--color-text-inverse)" }}
                  size={20}
                />
              </div>
              <span
                className="ml-3 text-xl font-bold truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                Teacher Portal
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  "var(--color-background-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                  style={{ stroke: "currentColor" }}
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto max-h-full">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    color: isActiveRoute(item.href)
                      ? "var(--color-interactive-primary)"
                      : "var(--color-text-secondary)",
                    backgroundColor: isActiveRoute(item.href)
                      ? "var(--color-brand-100)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActiveRoute(item.href)) {
                      e.target.style.backgroundColor =
                        "var(--color-background-tertiary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveRoute(item.href)) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <Icon
                    size={20}
                    className="mr-3 flex-shrink-0"
                    style={{ color: "currentColor" }}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div
            className="border-t p-4"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <div className="flex items-center mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--color-interactive-primary)" }}
              >
                <FiUser
                  style={{ color: "var(--color-text-inverse)" }}
                  size={20}
                />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {user?.firstName || user?.name || "User"}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {user?.roles && Array.isArray(user.roles)
                    ? user.roles.join(", ")
                    : user?.role || "No role"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm rounded-lg transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  "var(--color-background-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              <FiLogOut size={16} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
