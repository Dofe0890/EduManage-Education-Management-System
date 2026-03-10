import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

/**
 * OPTIMIZATION: Split StudentContext into Data + UI contexts
 * - StudentDataContext: Read-heavy (updated once per fetch)
 * - StudentUIContext: Write-heavy (loading, error states)
 *
 * This prevents UI state changes (loading) from triggering re-renders
 * of components that only read data (StudentsGrid).
 *
 * StudentDTO shape: { id, name, age, classroomId, status (bool), createdAt, updatedAt }
 */

// Data context: Students and totalCount (low-frequency updates)
const StudentDataContext = createContext();

// UI context: Loading and error states (high-frequency but fewer subscribers)
const StudentUIContext = createContext();

export const StudentProvider = ({ children }) => {
  // ===== DATA STATE (read-heavy, updated once per fetch) =====
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // ===== UI STATE (write-heavy, but separated so grid doesn't re-render) =====
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== DATA OPERATIONS =====
  const updateStudents = useCallback((newStudents) => {
    setStudents(newStudents);
  }, []);

  const addStudent = useCallback((student) => {
    setStudents((prev) => [...prev, student]);
  }, []);

  const updateStudent = useCallback((id, updatedStudent) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, ...updatedStudent } : student,
      ),
    );
  }, []);

  const removeStudent = useCallback((id) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
  }, []);

  const setStudentData = useCallback((data, count) => {
    setStudents(data);
    setTotalCount(count);
  }, []);

  // ===== UI OPERATIONS =====
  const setLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((error) => {
    setError(error);
  }, []);

  // ===== MEMOIZED CONTEXT VALUES =====
  // Memoize to ensure referential stability
  const dataValue = useMemo(
    () => ({
      students,
      totalCount,
      setStudents: updateStudents,
      addStudent,
      updateStudent,
      removeStudent,
      setStudentData,
    }),
    [
      students,
      totalCount,
      updateStudents,
      addStudent,
      updateStudent,
      removeStudent,
      setStudentData,
    ]
  );

  const uiValue = useMemo(
    () => ({
      loading,
      error,
      setLoading: setLoadingState,
      setError: setErrorState,
    }),
    [loading, error, setLoadingState, setErrorState]
  );

  return (
    <StudentDataContext.Provider value={dataValue}>
      <StudentUIContext.Provider value={uiValue}>
        {children}
      </StudentUIContext.Provider>
    </StudentDataContext.Provider>
  );
};

/**
 * Hook for reading student data only (prevents UI re-renders cascading to grid).
 * Use this in StudentsGrid to avoid re-renders when loading/error changes.
 */
export const useStudentData = () => {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error("useStudentData must be used within a StudentProvider");
  }
  return context;
};

/**
 * Hook for reading UI state only (loading, error).
 * Use this when you only need to display loading/error UI.
 */
export const useStudentUI = () => {
  const context = useContext(StudentUIContext);
  if (!context) {
    throw new Error("useStudentUI must be used within a StudentProvider");
  }
  return context;
};

/**
 * Backward compatibility hook (uses both contexts).
 * Only use this if you need both data and UI state together.
 * Prefer split hooks (useStudentData / useStudentUI) when possible.
 */
export const useStudentContext = () => {
  const dataContext = useContext(StudentDataContext);
  const uiContext = useContext(StudentUIContext);
  if (!dataContext || !uiContext) {
    throw new Error("useStudentContext must be used within a StudentProvider");
  }
  return { ...dataContext, ...uiContext };
};

export default StudentDataContext;
