using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentDataAccessLayer.Interfaces;
using StudentDataAccessLayer.Repository;
using StudentDataAccessLayer.Models;
using StudentDataAccessLayer;
using StudentBusinessLayer.Interfaces;
using StudentBusinessLayer.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using StudentBusinessLayer.Model;
using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.Common.Extensions;

namespace StudentBusinessLayer.Services
{
    public class StudentService : IStudentService
    {
        
        private readonly IUnitOfWork _unitOfWork;

        public StudentService (IUnitOfWork unitOfWork )
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Student> AddNewStudent(Student student)
        {
            if (student == null)
                throw new ArgumentNullException(nameof(student), "Student cannot be null.");

            if (student.ClassroomId <= 0)
                throw new ArgumentException("Classroom ID must be a positive number.", nameof(student.ClassroomId));

            var classroomExists = await _unitOfWork.Classrooms.GetByIDAsync(student.ClassroomId);
            if (classroomExists == null)
                throw new KeyNotFoundException($"Classroom with ID {student.ClassroomId} does not exist.");

            // Set audit fields in the business layer
            student.Status = true; // Active = true
            student.CreatedAt = DateTime.Now;
            student.UpdatedAt = DateTime.Now;

            var result = await _unitOfWork.Students.AddRecordAsync(student);
            await _unitOfWork.Complete();
            return result;
        }

        public async Task DeleteStudent(int id)
        {
            // This now performs soft delete by default
            await SoftDeleteStudent(id);
        }

        public async Task<Student> SoftDeleteStudent(int id)
        {
            var student = await _unitOfWork.Students.GetByIDAsync(id);
            if (student == null)
                throw new KeyNotFoundException($"Student with ID {id} not found.");

            // Set audit fields in the business layer
            student.Status = false; // Inactive = false
            student.UpdatedAt = DateTime.Now;

            // Update the student with the new status
            await _unitOfWork.Students.UpdateAsync(student);
            
            await _unitOfWork.Complete();
            return student;
        }

        public async Task EditStudent(int id, StudentDTO UpdatedStudent)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid student ID. ID must be a positive number.", nameof(id));

            if (UpdatedStudent == null)
                throw new ArgumentNullException(nameof(UpdatedStudent), "Student data cannot be null.");

            var student = await _unitOfWork.Students.GetByIDAsync(id);
            if (student == null)
                throw new KeyNotFoundException($"Student with ID {id} not found.");
            
            // Validate input data
            if (string.IsNullOrWhiteSpace(UpdatedStudent.name))
                throw new ArgumentException("Student name cannot be null or empty.", nameof(UpdatedStudent.name));
            
            if (UpdatedStudent.name.Length > 100)
                throw new ArgumentException("Student name cannot exceed 100 characters.", nameof(UpdatedStudent.name));
            
            if (UpdatedStudent.age < 6 || UpdatedStudent.age > 100)
                throw new ArgumentException("Student age must be between 6 and 100.", nameof(UpdatedStudent.age));

            if (UpdatedStudent.classroomId <= 0)
                throw new ArgumentException("Classroom ID must be a positive number.", nameof(UpdatedStudent.classroomId));

            // Update student properties
            student.Name = UpdatedStudent.name;
            student.Age = UpdatedStudent.age;
            student.ClassroomId = UpdatedStudent.classroomId;
            
            // Set audit field in the business layer
            student.UpdatedAt = DateTime.Now;
            
            await _unitOfWork.Students.UpdateAsync(student);
            
            var rowsAffected = await _unitOfWork.Complete();
            if (rowsAffected <= 0)
                throw new InvalidOperationException("Failed to update student. No changes were saved to the database.");
        }

        public async Task<(IEnumerable<Student> Items, int TotalCount)> GetStudents(StudentFilterDTO filter)
        {
            if (filter == null)
                throw new ArgumentNullException(nameof(filter), "Filter cannot be null.");

            // Validate pagination parameters
            if (filter.page <= 0)
                filter.page = 1; // Default to page 1
            
            if (filter.limit <= 0)
                filter.limit = 10; // Default to 10 items per page
            else if (filter.limit > 100)
                filter.limit = 100; // Maximum 100 items per page for performance

            filter.orderBy = filter.orderBy.FixAndValidateOrderBy();

            var query = _unitOfWork.Students.Query();

            if (!string.IsNullOrWhiteSpace(filter.name))
            {
                query = query.Where(a => EF.Functions.Like(a.Name, $"%{filter.name}%"));
            }

            if (filter.age.HasValue)
            {
                query = query.Where(a => a.Age == filter.age);
            }

            if (filter.classroomId.HasValue)
            {
                query = query.Where(a => a.ClassroomId == filter.classroomId);
            }

            if (filter.status.HasValue)
            {
                bool statusValue = filter.status == StudentStatus.Active;
                query = query.Where(a => a.Status == statusValue);
            }

            int totalCount = await query.CountAsync();
            query = query.ApplySorting(filter.orderBy, filter.isDescending);
            var items = await query.ApplyPagination(filter.page, filter.limit).ToListAsync();

            return (items, totalCount);
        }

        public async Task<Student> GetStudentById(int id)
        {
            return await _unitOfWork.Students.GetByIDAsync(id);
        }

        public async Task<IEnumerable<Student>> GetActiveStudents()
        {
            return await ((IStudentRepository)_unitOfWork.Students).GetActiveStudentsAsync();
        }

        public async Task<IEnumerable<Student>> GetStudentsByStatus(StudentStatus status)
        {
            return await ((IStudentRepository)_unitOfWork.Students).GetStudentsByStatusAsync(status);
        }
    }
}
