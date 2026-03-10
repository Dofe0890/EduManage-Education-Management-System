import { useEffect, useCallback, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService, teacherService } from "../services";
import { toast } from "react-toastify";
import { useAuthContext, useAuthDispatch } from "../contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const AuthProviderContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const authState = useAuthContext();
  const authActions = useAuthDispatch();

  const { user, token, teacherId, isAuthenticated, isLoading, isLoggingOut } =
    authState;

  const {
    setUser,
    setToken,
    setTeacherId,
    setIsAuthenticated,
    setIsLoading,
    setIsLoggingOut,
    resetAuthState,
  } = authActions;

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedTeacherId = localStorage.getItem("teacherId");

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          if (authService.isAuthenticated()) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setToken(storedToken);
            if (storedTeacherId) {
              setTeacherId(parseInt(storedTeacherId, 10));
            }
            setIsAuthenticated(true);
          } else {
            // Token expired, clear storage
            authService.clearAuthData();
            resetAuthState();
          }
        } catch (error) {
          authService.clearAuthData();
          resetAuthState();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (credentials) => {
      try {
        setIsLoading(true);
        const response = await authService.login(credentials);

        if (!response) {
          throw new Error("No response received from login service");
        }

        if (!response.token) {
          throw new Error("No token in login response");
        }

        if (!response.user) {
          throw new Error("No user data in login response");
        }

        // Store auth data in context and localStorage for persistence
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Update authenticated state
        setIsAuthenticated(true);

        toast.success(
          `Welcome back, ${response.user.name || response.user.email}!`,
        );

        // Navigate immediately - don't wait for teacher ID
        const from = location.state?.from?.pathname || "/app/dashboard";
        navigate(from, { replace: true });

        // Fetch teacher ID in background after navigation (non-blocking)
        setTimeout(async () => {
          try {
            if (
              response.user.roles?.includes("User") ||
              response.user.role === "User"
            ) {
              const teacher = await teacherService.getByUserId(
                response.user.userId,
              );
              storeTeacherId(teacher.id);
            }
          } catch (teacherError) {
            // Don't fail login if teacher fetch fails
          }
        }, 100);
      } catch (error) {
        // Re-throw the error so the login form can handle it
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      navigate,
      location.state,
      setUser,
      setToken,
      setIsAuthenticated,
      setIsLoading,
    ],
  );

  const storeTeacherId = useCallback(
    (id) => {
      setTeacherId(id);
      localStorage.setItem("teacherId", id);
    },
    [setTeacherId],
  );

  // Register function
  const register = useCallback(
    async (userData) => {
      try {
        setIsLoading(true);
        const response = await authService.register(userData);

        toast.success("Registration successful! Please login.");

        return response;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading],
  );

  // Logout function
  const logout = useCallback(async () => {
    // Prevent multiple simultaneous logout calls
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authService.logout();
    } catch (error) {
    } finally {
      // Clear state regardless of API call success
      resetAuthState();
      localStorage.removeItem("teacherId");
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Clear React Query cache
      queryClient.clear();

      // Use setTimeout to avoid React state update during render
      setTimeout(() => {
        navigate("/login", { replace: true });
        toast.info("You have been logged out.");
      }, 100);
    }
  }, [isLoggingOut, resetAuthState, queryClient, navigate, setIsLoggingOut]);

  // Update user profile
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        const response = await authService.getCurrentUser();
        const updatedUser = { ...response, ...profileData };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        toast.success("Profile updated successfully!");

        return updatedUser;
      } catch (error) {
        throw error;
      }
    },
    [setUser],
  );

  // Check user role
  const hasRole = useCallback(
    (role) => {
      if (!user || !user.role) return false;
      return user.role === role || user.roles?.includes(role);
    },
    [user],
  );

  // Is admin
  const isAdmin = useCallback(() => {
    return hasRole("Admin");
  }, [hasRole]);

  // Is user
  const isUser = useCallback(() => {
    return hasRole("User");
  }, [hasRole]);

  const value = {
    user,
    token,
    teacherId,
    isLoading,
    isAuthenticated,
    isLoggingOut,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    isUser,
  };

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
};
