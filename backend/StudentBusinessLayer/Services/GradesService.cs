using Microsoft.EntityFrameworkCore;
using StudentBusinessLayer.Interfaces;
using StudentDataAccessLayer.Interfaces;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.Common.Extensions;
using Microsoft.EntityFrameworkCore;

namespace StudentBusinessLayer.Services
{
    public class GradesService : IGradesService
    {

        private readonly IUnitOfWork _unitOfWork;
        public GradesService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Grade> AddGradeAsync(Grade grade)
        {
            if (grade == null)
                throw new ArgumentNullException(nameof(grade), "Grade cannot be null.");

            // Single query to check all related entities exist
            var student = await _unitOfWork.Students.Query()
                .FirstOrDefaultAsync(s => s.Id == grade.StudentId);
            var teacher = await _unitOfWork.Teachers.Query()
                .FirstOrDefaultAsync(t => t.Id == grade.TeacherId);
            var subject = await _unitOfWork.Subjects.Query()
                .FirstOrDefaultAsync(su => su.Id == grade.SubjectId);

            if (student == null)
                throw new KeyNotFoundException($"Student with ID {grade.StudentId} not found.");
            
            if (teacher == null)
                throw new KeyNotFoundException($"Teacher with ID {grade.TeacherId} not found.");
            
            if (subject == null)
                throw new KeyNotFoundException($"Subject with ID {grade.SubjectId} not found.");

            // Validate that teacher is assigned to this subject
            if (teacher.SubjectId != subject.Id)
                throw new InvalidOperationException($"Teacher with ID {grade.TeacherId} is not assigned to subject with ID {grade.SubjectId}.");

            var result = await _unitOfWork.Grades.AddRecordAsync(grade);
            await _unitOfWork.Complete();
            return result;
        }

        public async Task DeleteGradeAsync(int gradeId)
        {
            var existingGrade = await _unitOfWork.Grades.GetByIDAsync(gradeId);
            if (existingGrade == null)
                throw new KeyNotFoundException($"Grade with ID {gradeId} not found.");

            await _unitOfWork.Grades.DeleteByIdAsync(gradeId);
            await _unitOfWork.Complete();
        }

        public async Task<IEnumerable<Grade>> GetGradesAsync(GradeFilterDTO filter)
        {
            filter.orderBy = filter.orderBy.FixAndValidateOrderBy();


            var query = _unitOfWork.Grades.Query();

            if (filter.studentId.HasValue)
            {
                query = query.Where(a => a.StudentId == filter.studentId.Value);
            }


            if (filter.subjectId.HasValue)
            {
                query = query.Where(a => a.SubjectId == filter.subjectId);
            }

            if (filter.teacherId.HasValue)
            {
                query = query.Where(a => a.TeacherId == filter.teacherId);
            }


            var min = filter.minScore;
            var max = filter.maxScore;


            if (min.HasValue)
            {
                query = query.Where(a => a.Score >= min.Value);
            }

            if (max.HasValue)
            {
                query = query.Where(a => a.Score <= max.Value);
            }

            if (filter.dateGrade.HasValue && filter.dateFilterType.HasValue)
            {
                var date = filter.dateGrade.Value.Date;
                DateTime from;
                DateTime to;


                switch (filter.dateFilterType.Value)
                {
                    case GradeDateFilterType.Day:
                        from = date;
                        to = from.AddDays(1);
                        break;

                    case GradeDateFilterType.Month:
                        from = new DateTime(date.Year, date.Month, 1);
                        to = from.AddMonths(1);
                        break;

                    case GradeDateFilterType.Year:
                        from = new DateTime(date.Year, 1, 1);
                        to = from.AddYears(1);
                        break;

                    default:
                        from = DateTime.MinValue;
                        to = DateTime.MaxValue;
                        break;
                }

                if (from != DateTime.MinValue || to != DateTime.MaxValue)
                    query = query.Where(g => g.DateGrade >= from && g.DateGrade < to);

            }



            query = query.ApplySorting(filter.orderBy, filter.isDescending);
            query = query.ApplyPagination(filter.page, filter.limit);


            return await query.ToListAsync();
        }

        public async Task<Grade> GetGradeByIdAsync(int gradeId)
        {
            var result = await _unitOfWork.Grades.Query().Include(g => g.Student)
                               .Include(g => g.Subject)
                               .Include(g => g.Teacher)
                               .FirstOrDefaultAsync(g => g.Id == gradeId);

            return result;
        }

        public async Task UpdateGradeAsync(int gradeId, EditGradeDTO grade)
        {
            var existingGrade = await _unitOfWork.Grades.GetByIDAsync(gradeId);
            if (existingGrade == null)
                throw new KeyNotFoundException($"Grade with ID {gradeId} not found.");

            if (grade.score.HasValue && (grade.score.Value < 0 || grade.score.Value > 100))
                throw new ArgumentException("Grade score must be between 0 and 100.", nameof(grade.score));

            if (grade.dateGrade.HasValue && grade.dateGrade.Value > DateTime.Now)
                throw new ArgumentException("Grade date cannot be in the future.", nameof(grade.dateGrade));

            if (grade.score.HasValue)
                existingGrade.Score = grade.score.Value;

            if (grade.dateGrade.HasValue)
                existingGrade.DateGrade = grade.dateGrade.Value;

            if (grade.studentId.HasValue)
                existingGrade.StudentId = grade.studentId.Value;

            if (grade.subjectId.HasValue)
                existingGrade.SubjectId = grade.subjectId.Value;

            if (grade.teacherId.HasValue)
                existingGrade.TeacherId = grade.teacherId.Value;

            await _unitOfWork.Grades.UpdateAsync(existingGrade);
            await _unitOfWork.Complete();
        }
    }
}
