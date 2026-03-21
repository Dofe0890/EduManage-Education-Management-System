using StudentBusinessLayer.DTOs;
using StudentDataAccessLayer.Models;
using System.Linq.Expressions;
using StudentBusinessLayer.FilterDTOs;
namespace StudentBusinessLayer.Interfaces
{
    public interface IAttendancesService
    {
        Task<Attendance> GetAttendanceById(int id);
        Task<IEnumerable<Attendance>> GetAttendances(AttendanceFilterDTO filter);
        Task DeleteAttendance(int id);
        Task<Attendance> AddNewAttendancePerStudent(Attendance attendance);
        Task<Attendance> UpdateAttendance(int id, Attendance attendance);
        Task<IEnumerable<Attendance>> BulkUpdateAttendance(IEnumerable<Attendance> attendances);
        Task<int> CountAttendancePerStudent(int studentId);

    }
}