using StudentBusinessLayer.Interfaces;
using StudentDataAccessLayer.Interfaces;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using StudentBusinessLayer.DTOs;
using Microsoft.EntityFrameworkCore;
using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.Common.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace StudentBusinessLayer.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TeacherService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Teacher> GetTeacherByName(string name)
        {
            return await _unitOfWork.Teachers.Query().Include(t => t.Subject)
                .Include(t => t.TeacherClasses).ThenInclude(tc => tc.Classroom).
                FirstOrDefaultAsync(t => t.Name.Contains(name));


        }

        public async Task<Teacher> GetTeacherById(int id)
        {
            return await _unitOfWork.Teachers.Query().Include(t => t.Subject).Include(t=>t.User)
                 .Include(t => t.TeacherClasses).ThenInclude(tc => tc.Classroom).
                 FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Teacher> GetTeacherByUserIdAsync(string userId)
        {
            // Input validation - critical for preventing null reference exceptions
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException($"UserId cannot be null or empty.", nameof(userId));

            // Trim whitespace to prevent edge cases
            userId = userId.Trim();

            try
            {
                // Query with all required relationships for complete entity graph
                // Include: User (auth/email info), Subject (teaching subject), TeacherClasses (assigned classes)
                var teacher = await _unitOfWork.Teachers.Query()
                    .Include(t => t.User)  // ApplicationUser data
                    .Include(t => t.Subject)  // Subject information
                    .Include(t => t.TeacherClasses)  // Class assignments
                        .ThenInclude(tc => tc.Classroom)  // Classroom details
                    .FirstOrDefaultAsync(t => t.UserId == userId);

                // Return null if not found (caller can decide how to handle)
                // This is more graceful than throwing and allows for flexible error handling
                if (teacher == null)
                    return null;

                return teacher;
            }
            catch (InvalidOperationException ex)
            {
                // Handle database query exceptions
                throw new InvalidOperationException(
                    $"An error occurred while retrieving teacher with UserId '{userId}'. " +
                    $"The database may have duplicate teacher records for this user.",
                    ex);
            }
            catch (Exception ex)
            {
                // Catch any other unexpected exceptions
                throw new Exception(
                    $"An unexpected error occurred while retrieving teacher with UserId '{userId}'.",
                    ex);
            }
        }

        public async Task<IEnumerable<TeacherDTO>> GetTeachers(TeacherFilterDTO filter)
        {

            var query = _unitOfWork.Teachers.Query();

            if (!string.IsNullOrWhiteSpace(filter.name))
            {
                query = query.Where(a => EF.Functions.Like(a.Name, $"%{filter.name}%"));
            }


            if (!string.IsNullOrWhiteSpace(filter.userId))
            {
                query = query.Where(a => a.UserId == filter.userId);
            }


            if (filter.subjectId.HasValue)
            {
                query = query.Where(a => a.SubjectId == filter.subjectId);
            }

            if (!string.IsNullOrWhiteSpace(filter.email))
            {
                query = query.Where(t =>
                    EF.Functions.Like(t.User.Email, $"%{filter.email}%"));
            }


            query = query.ApplySorting(filter.orderBy, filter.isDescending);
            query = query.ApplyPagination(filter.page, filter.limit);

            return await query.Select(t => new TeacherDTO
            {   id= t.Id,
                name = t.Name,
                subjectId = t.SubjectId,
                email = t.User.Email,
                userId = t.UserId,
            }).ToListAsync();


        }

        public async Task<Teacher> AddNewTeacher(Teacher teacher)
        {
            var exists = await _unitOfWork.Teachers.AnyAsync(t => t.UserId == teacher.UserId);
            
            if (exists)
                throw new ArgumentException($"A teacher with UserId '{teacher.UserId}' already exists.");

            // Load the teacher with User to check email duplication
            var existingTeacherWithEmail = await _unitOfWork.Teachers.Query()
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.UserId == teacher.UserId);

            if (existingTeacherWithEmail != null)
            {
                var email = existingTeacherWithEmail.User?.Email;
                if (!string.IsNullOrEmpty(email))
                {
                    // Check if any other teacher has the same email
                    var emailDuplicate = await _unitOfWork.Teachers.Query()
                        .Include(t => t.User)
                        .AnyAsync(t => t.User.Email == email && t.Id != existingTeacherWithEmail.Id);

                    if (emailDuplicate)
                        throw new ArgumentException($"A teacher with email '{email}' already exists.");
                }
            }

            await _unitOfWork.Teachers.AddRecordAsync(teacher);
            await _unitOfWork.Complete();
            return teacher;
        }

        public async Task DeleteTeacher(int id)
        {
            bool isDeleted = await _unitOfWork.Teachers.DeleteByIdAsync(id);

            if (!isDeleted)
                throw new KeyNotFoundException($"Teacher with ID {id} not found.");

            await _unitOfWork.Complete();
        }

        public async Task EditTeacher(int id, TeacherDTO updatedTeacher)
        {
           var teacher = await _unitOfWork.Teachers
        .Query()
        .Include(t => t.User)
        .FirstOrDefaultAsync(t => t.Id == id);

    if (teacher == null)
        throw new KeyNotFoundException($"Teacher with ID {id} not found.");

    if (!string.IsNullOrWhiteSpace(updatedTeacher.email) &&
        updatedTeacher.email != teacher.User.Email)
    {
        var emailInUse = await _unitOfWork.Teachers
            .Query()
            .AnyAsync(t => t.User.Email == updatedTeacher.email && t.Id != id);

        if (emailInUse)
            throw new ArgumentException($"Email '{updatedTeacher.email}' is already in use by another teacher.");

        teacher.User.Email = updatedTeacher.email;
    }

    if (!string.IsNullOrWhiteSpace(updatedTeacher.name) &&
        updatedTeacher.name != teacher.Name)
    {
        teacher.Name = updatedTeacher.name;

        if (teacher.User.FirstName != updatedTeacher.name)
        {
            teacher.User.FirstName = updatedTeacher.name;
        }
    }

    if (updatedTeacher.subjectId.HasValue && updatedTeacher.subjectId > 0)
    {
        teacher.SubjectId = updatedTeacher.subjectId.Value;
    }

    await _unitOfWork.Teachers.UpdateAsync(teacher);
    await _unitOfWork.Complete();
        }

        public async Task<TeacherStudentCountDto> GetTeacherStudentCountAsync(int teacherId)
        {
            var teacher = await _unitOfWork.Teachers.Query()
                .Include(t => t.Subject)
                .Include(t => t.TeacherClasses)
                    .ThenInclude(tc => tc.Classroom)
                        .ThenInclude(c => c.Students)
                .FirstOrDefaultAsync(t => t.Id == teacherId);

            if (teacher == null)
                throw new KeyNotFoundException($"Teacher with ID {teacherId} not found.");

            // Get all unique students across all classes
            var allStudents = teacher.TeacherClasses
                .SelectMany(tc => tc.Classroom.Students)
                .Distinct()
                .ToList();

            var result = new TeacherStudentCountDto
            {
                TeacherId = teacher.Id,
                TeacherName = teacher.Name,
                TotalStudents = allStudents.Count,
                TotalClasses = teacher.TeacherClasses.Count,
                LastUpdated = DateTime.UtcNow,
                ClassBreakdown = teacher.TeacherClasses.Select(tc => new ClassStudentCountDto
                {
                    ClassId = tc.Classroom.Id,
                    ClassName = tc.Classroom.Name,
                    Subject = teacher.Subject?.Name ?? "Unknown",
                    StudentCount = tc.Classroom.Students.Count
                }).OrderBy(c => c.ClassName).ToList()
            };

            return result;
        }

        public async Task<TeacherDashboardMetricsDto> GetTeacherDashboardMetricsByUserIdAsync(string userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var teacher = await _unitOfWork.Teachers.Query()
                .Include(t => t.Subject)
                .Include(t => t.TeacherClasses).ThenInclude(tc => tc.Classroom)
                .FirstOrDefaultAsync(t => t.UserId == userId);
            if (teacher == null)
                throw new KeyNotFoundException("Teacher not found for the current user.");

            var classIds = teacher.TeacherClasses.Select(tc => tc.Classroom.Id).ToList();
Console.WriteLine(string.Join(", ", classIds));
            // If teacher has no classes, return safe defaults instead of nulls
            // if (classIds == null || !classIds.Any())
            // {
            //     return new TeacherDashboardMetricsDto
            //     {
            //         Subject = teacher.Subject != null ? new SubjectDTO { id = teacher.Subject.Id, name = teacher.Subject.Name } : null,
            //         HighestClassAverage = new ClassAverageDto { ClassId = 0, ClassName = "N/A", AverageGrade = 0 },
            //         HighestAttendanceClass = new ClassAttendanceDto { ClassId = 0, ClassName = "N/A", AttendancePercentage = 0, PresentCount = 0, TotalRecords = 0 },
            //         LastUpdated = DateTime.UtcNow
            //     };
            // }

            // Grades: compute average per class for grades assigned by this teacher
            var gradesQuery = _unitOfWork.Grades.Query().Include(g => g.Student).Where(g => g.TeacherId == teacher.Id && classIds.Contains(g.Student.ClassroomId));
         
        //  var debugGrade = await _unitOfWork.Grades.Query().Include(g => g.Student).Where(g => classIds.Contains(g.Student.ClassroomId)).CountAsync();

            if (startDate.HasValue)
                gradesQuery = gradesQuery.Where(g => g.DateGrade >= startDate.Value);
            if (endDate.HasValue)
                gradesQuery = gradesQuery.Where(g => g.DateGrade <= endDate.Value);
            var bestClassAvg = await gradesQuery
                .GroupBy(g => g.Student.ClassroomId)
                .Select(grp => new { ClassId = grp.Key, Avg = grp.Average(g => (double?)g.Score) })
                .OrderByDescending(x => x.Avg)
                .FirstOrDefaultAsync();
         


            ClassAverageDto highestAverage;
            if (bestClassAvg != null && bestClassAvg.Avg.HasValue)
            {
                var className = teacher.TeacherClasses.FirstOrDefault(tc => tc.Classroom.Id == bestClassAvg.ClassId)?.Classroom?.Name ?? "Unknown";
                highestAverage = new ClassAverageDto
                {
                    ClassId = bestClassAvg.ClassId,
                    ClassName = className,
                    AverageGrade = Math.Round(bestClassAvg.Avg.Value, 2)
                };
            }
            else
            {
                highestAverage = new ClassAverageDto { ClassId = 0, ClassName = "N/A", AverageGrade = 0 };
            }

            // Attendance: compute attendance percentage per class (present / total)
            var attendanceQuery = _unitOfWork.Attendance.Query().Include(a => a.Student).Where(a => classIds.Contains(a.Student.ClassroomId));

            if (startDate.HasValue)
                attendanceQuery = attendanceQuery.Where(a => a.Date >= startDate.Value);
            if (endDate.HasValue)
                attendanceQuery = attendanceQuery.Where(a => a.Date <= endDate.Value);

            var bestAttendance = await attendanceQuery
                .GroupBy(a => a.Student.ClassroomId)
                .Select(grp => new
                {
                    ClassId = grp.Key,
                    PresentCount = grp.Count(x => x.IsPresent),
                    Total = grp.Count()
                })
                .Where(x => x.Total > 0)
                .Select(x => new { x.ClassId, Percentage = (double)x.PresentCount * 100.0 / x.Total, x.PresentCount, x.Total })
                .OrderByDescending(x => x.Percentage)
                .FirstOrDefaultAsync();

            ClassAttendanceDto highestAttendance;
            if (bestAttendance != null)
            {
                var className = teacher.TeacherClasses.FirstOrDefault(tc => tc.Classroom.Id == bestAttendance.ClassId)?.Classroom?.Name ?? "Unknown";
                highestAttendance = new ClassAttendanceDto
                {
                    ClassId = bestAttendance.ClassId,
                    ClassName = className,
                    AttendancePercentage = Math.Round(bestAttendance.Percentage, 2),
                    PresentCount = bestAttendance.PresentCount,
                    TotalRecords = bestAttendance.Total
                };
            }
            else
            {
                highestAttendance = new ClassAttendanceDto { ClassId = 0, ClassName = "N/A", AttendancePercentage = 0, PresentCount = 0, TotalRecords = 0 };
            }

            var result = new TeacherDashboardMetricsDto
            {
                Subject = teacher.Subject != null ? new SubjectDTO { id = teacher.Subject.Id, name = teacher.Subject.Name } : null,
                HighestClassAverage = highestAverage,
                HighestAttendanceClass = highestAttendance,
                LastUpdated = DateTime.UtcNow
            };

            return result;
        }

       
    }
}