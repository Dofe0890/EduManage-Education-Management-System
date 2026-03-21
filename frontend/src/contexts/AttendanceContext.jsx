import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

/**
 * OPTIMIZATION: Split AttendanceContext into Data + UI contexts
 * - AttendanceDataContext: Read-heavy (updated once per fetch)
 * - AttendanceUIContext: Write-heavy (loading, error states)
 *
 * This prevents UI state changes (loading) from triggering re-renders
 * of components that only read data (AttendanceGrid).
 *
 * AttendanceDTO shape: { id, studentId, classroomId, attendanceDate, status, notes, teacherId }
 * AttendanceWithDetailsDTO shape: { Id, StudentId, Student, ClassroomId, Classroom, TeacherId, Teacher, AttendanceDate, Status, Notes }
 */

// Data context: Attendances and totalCount (low-frequency updates)
const AttendanceDataContext = createContext();

// UI context: Loading and error states (high-frequency but fewer subscribers)
const AttendanceUIContext = createContext();

export const AttendanceProvider = ({ children }) => {
  // ===== DATA STATE (read-heavy, updated once per fetch) =====
  const [attendances, setAttendances] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // ===== UI STATE (write-heavy, but separated so grid doesn't re-render) =====
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== DATA OPERATIONS =====
  const updateAttendances = useCallback((newAttendances) => {
    setAttendances(newAttendances);
  }, []);

  const addAttendance = useCallback((attendance) => {
    setAttendances((prev) => [...prev, attendance]);
    setTotalCount((prev) => prev + 1);
  }, []);

  const updateAttendance = useCallback((id, updatedAttendance) => {
    setAttendances((prev) =>
      prev.map((attendance) =>
        attendance.id === id ? { ...attendance, ...updatedAttendance } : attendance,
      ),
    );
  }, []);

  const removeAttendance = useCallback((id) => {
    setAttendances((prev) => prev.filter((attendance) => attendance.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
  }, []);

  const setAttendanceData = useCallback((data, count) => {
    setAttendances(data);
    setTotalCount(count);
  }, []);

  const bulkUpdateAttendance = useCallback((updatedRecords) => {
    setAttendances((prev) => {
      const updatedMap = new Map(
        updatedRecords.map((record) => [record.id, record])
      );
      return prev.map((attendance) =>
        updatedMap.has(attendance.id)
          ? { ...attendance, ...updatedMap.get(attendance.id) }
          : attendance
      );
    });
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
      attendances,
      totalCount,
      setAttendances: updateAttendances,
      addAttendance,
      updateAttendance,
      removeAttendance,
      setAttendanceData,
      bulkUpdateAttendance,
    }),
    [
      attendances,
      totalCount,
      updateAttendances,
      addAttendance,
      updateAttendance,
      removeAttendance,
      setAttendanceData,
      bulkUpdateAttendance,
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
    <AttendanceDataContext.Provider value={dataValue}>
      <AttendanceUIContext.Provider value={uiValue}>
        {children}
      </AttendanceUIContext.Provider>
    </AttendanceDataContext.Provider>
  );
};

/**
 * Hook for reading attendance data only (prevents UI re-renders cascading to grid).
 * Use this in AttendanceGrid to avoid re-renders when loading/error changes.
 */
export const useAttendanceData = () => {
  const context = useContext(AttendanceDataContext);
  if (!context) {
    throw new Error("useAttendanceData must be used within an AttendanceProvider");
  }
  return context;
};

/**
 * Hook for reading UI state only (loading, error).
 * Use this when you only need to display loading/error UI.
 */
export const useAttendanceUI = () => {
  const context = useContext(AttendanceUIContext);
  if (!context) {
    throw new Error("useAttendanceUI must be used within an AttendanceProvider");
  }
  return context;
};

/**
 * Backward compatibility hook (uses both contexts).
 * Only use this if you need both data and UI state together.
 * Prefer split hooks (useAttendanceData / useAttendanceUI) when possible.
 */
export const useAttendanceContext = () => {
  const dataContext = useContext(AttendanceDataContext);
  const uiContext = useContext(AttendanceUIContext);
  if (!dataContext || !uiContext) {
    throw new Error("useAttendanceContext must be used within an AttendanceProvider");
  }
  return { ...dataContext, ...uiContext };
};

export default AttendanceDataContext;
