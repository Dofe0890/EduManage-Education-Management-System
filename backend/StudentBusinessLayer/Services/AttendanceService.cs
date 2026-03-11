using Microsoft.EntityFrameworkCore;
using StudentBusinessLayer.Interfaces;
using StudentDataAccessLayer.Interfaces;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Expressions;
using StudentBusinessLayer.Common.Extensions;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.FilterDTOs;
using Microsoft.EntityFrameworkCore;

namespace StudentBusinessLayer.Services
{
    public class AttendanceService:IAttendancesService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AttendanceService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Attendance> AddNewAttendancePerStudent(Attendance attendance)
        {
            if (attendance == null)
                throw new ArgumentNullException(nameof(attendance), "Attendance cannot be null.");
            
            if (attendance.StudentId <= 0)
                throw new ArgumentException("Student ID must be greater than 0.", nameof(attendance.StudentId));

            var isStudentExist = await _unitOfWork.Students.GetByIDAsync(attendance.StudentId);
            if (isStudentExist == null)
                throw new KeyNotFoundException($"Student with ID {attendance.StudentId} not found.");

            var result = await _unitOfWork.Attendance.AddRecordAsync(attendance);
            await _unitOfWork.Complete();
            return result;
        }

        public async Task<int> CountAttendancePerStudent(int studentId)
        {
            var result = await _unitOfWork.Attendance.Count(s => s.StudentId == studentId && s.IsPresent == true);
            return result;
        }

        public async Task DeleteAttendance(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Attendance ID must be greater than 0.", nameof(id));
                
            var result = await _unitOfWork.Attendance.GetByIDAsync(id);
            if (result == null)
                throw new KeyNotFoundException($"Attendance with ID {id} not found.");

            await _unitOfWork.Attendance.DeleteByIdAsync(id);
            await _unitOfWork.Complete();
        }

        public async Task<IEnumerable<Attendance>> GetAttendances(AttendanceFilterDTO filter)
        {
          filter.orderBy =   filter.orderBy.FixAndValidateOrderBy();

            var query = _unitOfWork.Attendance.Query();

            var from = filter.fromDate?.Date;
            var to = filter.toDate?.Date.AddDays(1).AddTicks(-1);

            if (filter.studentId.HasValue)
            {
                query = query.Where(a => a.StudentId == filter.studentId.Value);
            }

            if (from.HasValue)
            {
                query = query.Where(a => a.Date >= from.Value);
            }
            
            if (to.HasValue)
            {
                query = query.Where(a => a.Date <= to.Value);
            }
            
            if (filter.isPresent.HasValue)
            {
                query = query.Where(a => a.IsPresent == filter.isPresent.Value);
            }


            query = query.ApplySorting(filter.orderBy, filter.isDescending);
            query = query.ApplyPagination(filter.page, filter.limit);


            return await query.ToListAsync();
        }


        public async Task<Attendance> GetAttendanceById(int id)
        {
            return await _unitOfWork.Attendance.GetByIDAsync(id);
        }

    
    }
}
