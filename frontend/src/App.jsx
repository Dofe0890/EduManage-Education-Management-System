import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./config/queryClient";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { AuthProvider as AuthContextProvider } from "./contexts/AuthContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import { StudentProvider } from "./contexts/StudentContext";
import { GradeProvider } from "./contexts/GradeContext";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import Layout from "./components/layout/Layout";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";
import Loading from "./components/common/Loading";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/error/NotFoundPage";
import UnauthorizedPage from "./pages/error/UnauthorizedPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";

// Dashboard
import DashboardPage from "./pages/dashboard/DashboardPage";
import { dashboardLoader } from "./loaders/dashboardLoader";

// All Students Page
import { studentsLoader } from "./loaders/studentsLoader";

// Student Management
import StudentsPage from "./pages/students/StudentsPage";
import CreateStudent from "./pages/students/CreateStudent";

// All Classes Page
import { classesLoader } from "./loaders/classesLoader";

// Classes Management
import ClassesPage from "./pages/classes/ClassesPage";

// Teacher Management
import TeachersPage from "./pages/teachers/TeachersPage";
import CreateTeacher from "./pages/teachers/CreateTeacher";
import EditTeacher from "./pages/teachers/EditTeacher";

// Subject Management
import SubjectsPage from "./pages/subjects/SubjectsPage";

// Grade Management
import GradesPage from "./pages/grades/GradesPage";
import CreateGrade from "./pages/grades/CreateGrade";
import EditGrade from "./pages/grades/EditGrade";

// Attendance Management
import AttendancesPage from "./pages/attendance/AttendancesPage";
import MarkAttendance from "./pages/attendance/MarkAttendance";

// User Management
import UsersPage from "./pages/users/UsersPage";
import CreateUser from "./pages/users/CreateUser";
import EditUser from "./pages/users/EditUser";

// Settings
import ProfilePage from "./pages/settings/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import { ToastContainer } from "react-toastify";

function App() {
  // Create router with data API support
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: (
          <AuthProvider>
            <LandingPage />
          </AuthProvider>
        ),
        errorElement: (
          <AuthProvider>
            <RouteErrorBoundary />
          </AuthProvider>
        ),
      },
      {
        path: "/login",
        element: (
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        ),
        errorElement: (
          <AuthProvider>
            <RouteErrorBoundary />
          </AuthProvider>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <AuthProvider>
            <ForgotPasswordPage />
          </AuthProvider>
        ),
        errorElement: (
          <AuthProvider>
            <RouteErrorBoundary />
          </AuthProvider>
        ),
      },
      {
        path: "/app",
        element: (
          <AuthProvider>
            <Layout />
          </AuthProvider>
        ),
        errorElement: (
          <AuthProvider>
            <RouteErrorBoundary />
          </AuthProvider>
        ),
        loader: (args) => {
          // Get teacherId for the layout context
          const teacherId = localStorage.getItem("teacherId");
          return { teacherId };
        },
        children: [
          {
            index: true,
            element: <Navigate to="/app/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
            loader: dashboardLoader,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "students",
            element: (
              <AuthProvider>
                <StudentProvider>
                  <StudentsPage />
                </StudentProvider>
              </AuthProvider>
            ),
            loader: studentsLoader(queryClient),
            errorElement: (
              <AuthProvider>
                <RouteErrorBoundary />
              </AuthProvider>
            ),
          },
          {
            path: "classes",
            element: (
              <AuthProvider>
                <ClassesPage />
              </AuthProvider>
            ),
            loader: classesLoader(queryClient),
            errorElement: (
              <AuthProvider>
                <RouteErrorBoundary />
              </AuthProvider>
            ),
          },
          {
            path: "students/new",
            element: (
              <StudentProvider>
                <CreateStudent />
              </StudentProvider>
            ),
            errorElement: <RouteErrorBoundary />,
          },

          {
            path: "teachers",
            element: <TeachersPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "teachers/new",
            element: <CreateTeacher />,
            errorElement: <RouteErrorBoundary />,
          },

          {
            path: "teachers/:id/edit",
            element: <EditTeacher />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "subjects",
            element: <SubjectsPage />,
            errorElement: <RouteErrorBoundary />,
          },

          {
            path: "grades",
            element: (
              <GradeProvider>
                <GradesPage />
              </GradeProvider>
            ),
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "grades/new",
            element: (
              <GradeProvider>
                <CreateGrade />
              </GradeProvider>
            ),
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "grades/:id/edit",
            element: (
              <GradeProvider>
                <EditGrade />
              </GradeProvider>
            ),
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "attendance",
            element: <Navigate to="/app/attendance/records" replace />,
          },
          {
            path: "attendance/records",
            element: (
              <AttendanceProvider>
                <AttendancesPage />
              </AttendanceProvider>
            ),
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "attendance/mark",
            element: (
              <AttendanceProvider>
                <MarkAttendance />
              </AttendanceProvider>
            ),
            errorElement: <RouteErrorBoundary />,
          },

          {
            path: "users",
            element: <UsersPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "users/new",
            element: <CreateUser />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "users/:id/edit",
            element: <EditUser />,
            errorElement: <RouteErrorBoundary />,
          },

          {
            path: "profile",
            element: <ProfilePage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
            errorElement: <RouteErrorBoundary />,
          },
        ],
      },
      {
        path: "/unauthorized",
        element: (
          <AuthProvider>
            <UnauthorizedPage />
          </AuthProvider>
        ),
        errorElement: (
          <AuthProvider>
            <RouteErrorBoundary />
          </AuthProvider>
        ),
      },
      {
        path: "*",
        element: (
          <AuthProvider>
            <NotFoundPage />
          </AuthProvider>
        ),
        errorElement: (
          <AuthProvider>
            <RouteErrorBoundary />
          </AuthProvider>
        ),
      },
    ],
    {
      future: {
        v7_startTransition: true,
      },
    },
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <AppProvider>
          <AppContent router={router} />
        </AppProvider>
      </AuthContextProvider>

      {/* React Query DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Separate component to use AppContext
function AppContent({ router }) {
  const { globalLoading, loadingMessage } = useApp();

  return (
    <div className="App">
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />

      {/* Toast Container - Default styling */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Global Loading Overlay */}
      {globalLoading && <Loading message={loadingMessage} size="large" />}
    </div>
  );
}

export default App;
