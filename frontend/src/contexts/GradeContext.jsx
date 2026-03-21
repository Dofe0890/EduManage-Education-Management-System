import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

/**
 * OPTIMIZATION: Split GradeContext into Data + UI contexts
 * - GradeDataContext: Read-heavy (updated once per fetch)
 * - GradeUIContext: Write-heavy (loading, error states)
 *
 * This prevents UI state changes (loading) from triggering re-renders
 * of components that only read data (GradesGrid).
 *
 * GradeDTO shape: { id, studentId, subjectId, teacherId, score, dateGrade }
 * GradeWithDetailsDTO shape: { StudentId, Student, SubjectId, Subject, TeacherId, Teacher, Score, DateGrade }
 */

// Data context: Grades and totalCount (low-frequency updates)
const GradeDataContext = createContext();

// UI context: Loading and error states (high-frequency but fewer subscribers)
const GradeUIContext = createContext();

export const GradeProvider = ({ children }) => {
  // ===== DATA STATE (read-heavy, updated once per fetch) =====
  const [grades, setGrades] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // ===== UI STATE (write-heavy, but separated so grid doesn't re-render) =====
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== DATA OPERATIONS =====
  const updateGrades = useCallback((newGrades) => {
    setGrades(newGrades);
  }, []);

  const addGrade = useCallback((grade) => {
    setGrades((prev) => [...prev, grade]);
  }, []);

  const updateGrade = useCallback((id, updatedGrade) => {
    setGrades((prev) =>
      prev.map((grade) =>
        grade.id === id ? { ...grade, ...updatedGrade } : grade,
      ),
    );
  }, []);

  const removeGrade = useCallback((id) => {
    console.log("🗑️ Context removeGrade called with ID:", id, "(type:", typeof id, ")");
    setGrades((prev) => {
      const filtered = prev.filter((grade) => {
        const gradeId = grade.id ?? grade.Id;
        const idMatch = gradeId === id;
        const looseMatch = gradeId == id;
        if (!idMatch) {
          console.log("  Comparing:", gradeId, "(", typeof gradeId, ") !== ", id, "(", typeof id, ") [strict:", idMatch, ", loose:", looseMatch, "]");
        }
        return !idMatch;
      });
      console.log("  Result: Removed", prev.length - filtered.length, "records.", filtered.length, "remain.");
      return filtered;
    });
  }, []);

  const setGradeData = useCallback((data, count) => {
    console.log("📊 Context setGradeData called with", data?.length ?? 0, "items, count:", count);
    if (data && data.length > 0) {
      console.log("  First item ID:", data[0].id ?? data[0].Id, "Last item ID:", data[data.length - 1].id ?? data[data.length - 1].Id);
    }
    setGrades(data);
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
      grades,
      totalCount,
      setGrades: updateGrades,
      addGrade,
      updateGrade,
      removeGrade,
      setGradeData,
    }),
    [
      grades,
      totalCount,
      updateGrades,
      addGrade,
      updateGrade,
      removeGrade,
      setGradeData,
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
    <GradeDataContext.Provider value={dataValue}>
      <GradeUIContext.Provider value={uiValue}>
        {children}
      </GradeUIContext.Provider>
    </GradeDataContext.Provider>
  );
};

/**
 * Hook for reading grade data only (prevents UI re-renders cascading to grid).
 * Use this in GradesGrid to avoid re-renders when loading/error changes.
 */
export const useGradeData = () => {
  const context = useContext(GradeDataContext);
  if (!context) {
    throw new Error("useGradeData must be used within a GradeProvider");
  }
  return context;
};

/**
 * Hook for reading UI state only (loading, error).
 * Use this when you only need to display loading/error UI.
 */
export const useGradeUI = () => {
  const context = useContext(GradeUIContext);
  if (!context) {
    throw new Error("useGradeUI must be used within a GradeProvider");
  }
  return context;
};

/**
 * Backward compatibility hook (uses both contexts).
 * Only use this if you need both data and UI state together.
 * Prefer split hooks (useGradeData / useGradeUI) when possible.
 */
export const useGradeContext = () => {
  const dataContext = useContext(GradeDataContext);
  const uiContext = useContext(GradeUIContext);
  if (!dataContext || !uiContext) {
    throw new Error("useGradeContext must be used within a GradeProvider");
  }
  return { ...dataContext, ...uiContext };
};

export default GradeDataContext;
