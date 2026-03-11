using FluentValidation;
using StudentBusinessLayer.DTOs;

namespace StudentBusinessLayer.Validation
{
    public class StudentDTOValidator : AbstractValidator<StudentDTO>
    {
        public StudentDTOValidator()
        {
            RuleFor(x => x.name)
                .NotEmpty().WithMessage("Student name is required")
                .Length(2, 15).WithMessage("Student name must be between 2 and 15 characters")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("Student name can only contain letters and spaces");

            RuleFor(x => x.age)
                .GreaterThan(4).WithMessage("Age must be greater than 4")
                .LessThan(80).WithMessage("Age must be less than 80");

            RuleFor(x => x.classroomId)
                .GreaterThan(0).WithMessage("Classroom ID must be greater than 0");
        }
    }

    public class TeacherDTOValidator : AbstractValidator<TeacherDTO>
    {
        public TeacherDTOValidator()
        {
            RuleFor(x => x.name)
                .NotEmpty().WithMessage("Teacher name is required")
                .Length(2, 15).WithMessage("Teacher name must be between 2 and 15 characters")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("Teacher name can only contain letters and spaces");

            RuleFor(x => x.email).EmailAddress()
                  .WithMessage("Please enter a valid email address");

          
            RuleFor(x => x.subjectId)
                .GreaterThan(0).WithMessage("Subject ID must be greater than 0");
        }
    }

    public class GradeDTOValidator : AbstractValidator<GradeDTO>
    {
        public GradeDTOValidator()
        {
            RuleFor(x => x.studentId)
                .GreaterThan(0).WithMessage("Student ID must be greater than 0");

            RuleFor(x => x.teacherId)
                .GreaterThan(0).WithMessage("Teacher ID must be greater than 0");

            RuleFor(x => x.subjectId)
                .GreaterThan(0).WithMessage("Subject ID must be greater than 0");

            RuleFor(x => x.score)
                .InclusiveBetween(0, 100).WithMessage("Score must be between 0 and 100");
        }
    }

    public class AttendanceDTOValidator : AbstractValidator<AttendanceDTO>
    {
        public AttendanceDTOValidator()
        {
            RuleFor(x => x.studentId)
                .GreaterThan(0).WithMessage("Student ID must be greater than 0");

            RuleFor(x => x.date)
                .NotEmpty().WithMessage("Date is required")
                .LessThanOrEqualTo(DateTime.Today).WithMessage("Attendance date cannot be in the future");

            RuleFor(x => x.status)
                .Must(status => status == AttendanceStatus.Present || status == AttendanceStatus.Excused || status == AttendanceStatus.Absent)
                .WithMessage("Status must be Present, Absent, or excused");
        }
    }

    public class ClassroomDTOValidator : AbstractValidator<ClassroomDTO>
    {
        public ClassroomDTOValidator()
        {
            RuleFor(x => x.name)
                .NotEmpty().WithMessage("Classroom name is required")
                .Length(2, 50).WithMessage("Classroom name must be between 2 and 50 characters")
                .Matches(@"^[a-zA-Z0-9\s\-]+$").WithMessage("Classroom name can only contain letters, numbers, spaces, and hyphens");
        }
    }
}
