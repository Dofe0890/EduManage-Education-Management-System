import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiBook,
  FiSettings,
  FiLogOut,
  FiUser,
  FiBell,
  FiSearch,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useApp } from "../../contexts/AppContext";
import { toast } from "react-toastify";
import navItems from "../../config/navItems.js";
const Header = ({ sidebarOpen, setSidebarOpen, isDark, toggleTheme }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };
  const handelNotifications = () => {
    setShowNotifications(!showNotifications);
    const id = setInterval(() => {
      setShowNotifications(false);
      return clearInterval(id);
    }, 3000);
  };
  const handelUserMenu = () => {
    setShowUserMenu(!showNotifications);
    const id = setInterval(() => {
      setShowUserMenu(false);
      return clearInterval(id);
    }, 3000);
  };
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

  return (
    <header
      className="shadow-sm border-b"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        borderColor: "var(--color-border-primary)",
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen()}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset"
              style={{
                color: "var(--color-text-secondary)",
                backgroundColor: "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  "var(--color-background-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Logo */}
            <Link
              to="/app/dashboard"
              className="flex items-center ml-4 lg:ml-0"
            >
              <div className="flex-shrink-0">
                <div
                  className="w-auto h-10 rounded-lg flex items-center justify-center px-3"
                  style={{
                    backgroundColor: "var(--color-interactive-primary)",
                  }}
                >
                  <FiBook
                    size={20}
                    style={{ color: "var(--color-text-inverse)" }}
                  />
                  <span
                    className="ml-3 text-lg font-bold truncate"
                    style={{ color: "var(--color-text-inverse)" }}
                  >
                    EduManage
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex ml-10 space-x-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                    <div className="flex items-center">
                      <Icon
                        size={16}
                        className="mr-2"
                        style={{ color: "currentColor" }}
                      />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={() => toggleTheme()}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset"
              style={{
                color: "var(--color-text-tertiary)",
                backgroundColor: "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  "var(--color-background-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handelNotifications}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset relative"
                style={{
                  color: "var(--color-text-secondary)",
                  backgroundColor: "transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor =
                    "var(--color-background-tertiary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                <FiBell size={20} />
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--color-error)" }}
                ></span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-primary)",
                  }}
                >
                  <div
                    className="p-4 border-b"
                    style={{ borderColor: "var(--color-border-primary)" }}
                  >
                    <h3
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div
                      className="p-4 text-center"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      No new notifications
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={handelUserMenu}
                  className="flex items-center space-x-3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset"
                  style={{
                    backgroundColor: "transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor =
                      "var(--color-background-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--color-interactive-primary)",
                    }}
                  >
                    <FiUser
                      style={{ color: "var(--color-text-inverse)" }}
                      size={16}
                    />
                  </div>
                  <span
                    className="hidden md:block text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {user?.firstName || user?.name || "User"}
                  </span>
                </button>

                {/* User dropdown */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50"
                    style={{
                      backgroundColor: "var(--color-background-secondary)",
                      borderColor: "var(--color-border-primary)",
                    }}
                  >
                    <div className="py-1">
                      <Link
                        to="/app/profile"
                        className="flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ color: "var(--color-text-secondary)" }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor =
                            "var(--color-background-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiUser className="mr-3" size={16} />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ color: "var(--color-text-secondary)" }}
                        onClick={() => setShowUserMenu(false)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor =
                            "var(--color-background-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiSettings className="mr-3" size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                        style={{ color: "var(--color-text-secondary)" }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor =
                            "var(--color-background-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiLogOut className="mr-3" size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
