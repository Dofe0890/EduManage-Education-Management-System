import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import EditGradeModal from "../../components/grades/EditGradeModal";
/**
 * EditGrade page - Form for editing existing grades.
 * Fetches grade by ID, students, subjects, and teachers on mount.
 * Pre-populates form with existing grade data.
 */
const EditGrade = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [grade, setGrade] = useState(null);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      studentId: "",
      subjectId: "",
      teacherId: "",
      score: "",
    },
  });

  return (
    <EditGradeModal
      grade={grade}
      students={students}
      subjects={subjects}
      teachers={teachers}
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/app/grades")}
    />
  );
};

export default EditGrade;
