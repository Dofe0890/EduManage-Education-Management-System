using Microsoft.EntityFrameworkCore;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.Interfaces;
using StudentDataAccessLayer.Interfaces;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentBusinessLayer.Common.Extensions;
using Microsoft.EntityFrameworkCore;

namespace StudentBusinessLayer.Services
{
    public class ClassroomService : IClassroomService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ClassroomService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        public async Task AssignTeacherAsync(int classroomId, int teacherId)
        {
            var isTeacherExist = await _unitOfWork.Teachers.GetByIDAsync(teacherId);
            var isClassroomExist = await _unitOfWork.Classrooms.GetByIDAsync(classroomId);

            if (isClassroomExist == null)
                throw new KeyNotFoundException($"Classroom with ID {classroomId} not found.");
            
            if (isTeacherExist == null)
                throw new KeyNotFoundException($"Teacher with ID {teacherId} not found.");

            var exist = await _unitOfWork.TeacherClasses.AnyAsync(c => c.TeacherID == teacherId && c.ClassroomID == classroomId);
            if (exist)
                throw new InvalidOperationException($"Teacher with ID {teacherId} is already assigned to classroom with ID {classroomId}.");

            var result = await _unitOfWork.TeacherClasses.AddRecordAsync(new TeacherClass
            {
                ClassroomID = classroomId,
                TeacherID = teacherId
            });
            await _unitOfWork.Complete();
        }

        public async Task<Classroom> CreateClassroomAsync(Classroom classroom)
        {
            if (classroom == null)
                throw new ArgumentNullException(nameof(classroom), "Classroom cannot be null.");
            
            if (string.IsNullOrWhiteSpace(classroom.Name))
                throw new ArgumentException("Classroom name cannot be null or empty.", nameof(classroom.Name));

            var result = await _unitOfWork.Classrooms.AddRecordAsync(classroom);
            await _unitOfWork.Complete();
            return classroom;
        }

        public async Task DeleteClassroomAsync(int classroomId)
        {
            var existClass = await _unitOfWork.Classrooms.GetByIDAsync(classroomId);
            if (existClass == null)
                throw new KeyNotFoundException($"Classroom with ID {classroomId} not found.");

            await _unitOfWork.Classrooms.DeleteByIdAsync(classroomId);
            await _unitOfWork.Complete();
        }

        public async Task EditClassroomAsync(int classroomId, string newClassroomName)
        {
            if (string.IsNullOrWhiteSpace(newClassroomName))
                throw new ArgumentException("Classroom name cannot be null or empty.", nameof(newClassroomName));
            
            var existClass = await _unitOfWork.Classrooms.GetByIDAsync(classroomId);
            if (existClass == null)
                throw new KeyNotFoundException($"Classroom with ID {classroomId} not found.");
            
            existClass.Name = newClassroomName;
            await _unitOfWork.Classrooms.UpdateAsync(existClass);
            await _unitOfWork.Complete();
        }

        public async Task<(IEnumerable<Classroom> Items, int TotalCount)> GetAllClassesAsync(ClassroomFilterDTO filter)
        {
            filter.orderBy = filter.orderBy.FixAndValidateOrderBy();

            var query = _unitOfWork.Classrooms.Query();

            if (!string.IsNullOrWhiteSpace(filter.name))
            {
                query = query.Where(a => EF.Functions.Like(a.Name, $"%{filter.name}%"));
            }

            int totalCount = await query.CountAsync();
            query = query.ApplySorting(filter.orderBy, filter.isDescending);
            var items = await query.ApplyPagination(filter.page, filter.limit).ToListAsync();

            return (items, totalCount);
        }

        public async Task<Classroom> GetClassByIdWithDetails(int classroomId)
        {
            return await _unitOfWork.Classrooms.Query()
                .Include(c => c.Students)
                .Include(c => c.TeacherClasses)
                .ThenInclude(tc => tc.Teacher).FirstOrDefaultAsync(s => s.Id == classroomId);
        }
    
        public async Task<IEnumerable<Classroom>> GetClassesByName(string name) 
        {
            return await _unitOfWork.Classrooms.Query()
                .Include(c => c.Students)
                .Include(c => c.TeacherClasses)
                    .ThenInclude(tc => tc.Teacher)
                .Where(c => EF.Functions.Like(c.Name, $"%{name}%"))
                .ToListAsync();
        }
    }
}
