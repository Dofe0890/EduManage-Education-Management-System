import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useApp } from "../../contexts/AppContext";
import ProtectedRoute from "../common/ProtectedRoute";

const Layout = () => {
  const { sidebarOpen, closeSidebar, toggleSidebar, isDark, toggleTheme } =
    useApp();

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen flex flex-col lg:flex-row"
        style={{ backgroundColor: "var(--color-background-primary)" }}
      >
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={toggleSidebar}
            isDark={isDark}
            toggleTheme={toggleTheme}
          />

          {/* Page content */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>

          {/* Footer */}
          <footer
            className="border-t py-4 px-6 mt-auto"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              borderColor: "var(--color-border-primary)",
            }}
          >
            <div
              className="text-center text-sm"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              © 2024 EduManage Student Management System. All rights reserved.
            </div>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
