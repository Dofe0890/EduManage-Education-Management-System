import React, { createContext, useContext, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { useServiceLoading } from "../hooks/useServiceLoading";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, isDark, isLight, toggleTheme, setThemeMode } = useTheme();
  const {
    isLoading: globalLoading,
    loadingMessage,
    executeServiceCall,
  } = useServiceLoading();

  // Sidebar functions
  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      return !prev;
    });
  };

  return (
    <AppContext.Provider
      value={{
        // Sidebar state and functions
        sidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,

        // Theme state and functions
        theme,
        isDark,
        isLight,
        toggleTheme,
        setThemeMode,

        // Global loading state and service execution
        globalLoading,
        loadingMessage,
        executeServiceCall,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
