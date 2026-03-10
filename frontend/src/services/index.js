// Export all services for easy importing
import { authService } from "./authService.js";
import { studentService } from "./studentService.js";
import { teacherService } from "./teacherService.js";
import { subjectService } from "./subjectService.js";
import { gradeService } from "./gradeService.js";
import { attendanceService } from "./attendanceService.js";
import api from "./axios.js";

export {
  authService,
  studentService,
  teacherService,
  subjectService,
  gradeService,
  attendanceService,
  api,
};
