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
        Task<int> CountAttendancePerStudent(int studentId);

    }
}