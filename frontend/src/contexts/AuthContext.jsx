import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);
const AuthDispatchContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error("useAuthDispatch must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    teacherId: null,
    isAuthenticated: false,
    isLoading: true,
    isLoggingOut: false,
  });

  const updateAuthState = useCallback((updates) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setUser = useCallback((user) => {
    setAuthState((prev) => ({ ...prev, user }));
  }, []);

  const setToken = useCallback((token) => {
    setAuthState((prev) => ({ ...prev, token }));
  }, []);

  const setTeacherId = useCallback((teacherId) => {
    setAuthState((prev) => ({ ...prev, teacherId }));
  }, []);

  const setIsAuthenticated = useCallback((isAuthenticated) => {
    setAuthState((prev) => ({ ...prev, isAuthenticated }));
  }, []);

  const setIsLoading = useCallback((isLoading) => {
    setAuthState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setIsLoggingOut = useCallback((isLoggingOut) => {
    setAuthState((prev) => ({ ...prev, isLoggingOut }));
  }, []);

  const resetAuthState = useCallback(() => {
    setAuthState({
      user: null,
      token: null,
      teacherId: null,
      isAuthenticated: false,
      isLoading: false,
      isLoggingOut: false,
    });
  }, []);

  const authActions = {
    setUser,
    setToken,
    setTeacherId,
    setIsAuthenticated,
    setIsLoading,
    setIsLoggingOut,
    updateAuthState,
    resetAuthState,
  };

  return (
    <AuthContext.Provider value={authState}>
      <AuthDispatchContext.Provider value={authActions}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
};

export default AuthContext;
