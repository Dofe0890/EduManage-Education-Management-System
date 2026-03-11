using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.FilterDTOs;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.Interfaces
{
    public interface ITeacherService
    {
        Task<Teacher> GetTeacherById(int id);
        Task<Teacher> GetTeacherByName(string name);
        Task EditTeacher(int id, TeacherDTO updatedTeacher);
        Task DeleteTeacher(int id);
        Task<Teacher> AddNewTeacher(Teacher  teacher);
        Task<IEnumerable<TeacherDTO>> GetTeachers(TeacherFilterDTO filter);
        Task<TeacherStudentCountDto> GetTeacherStudentCountAsync(int teacherId);
        Task<TeacherDashboardMetricsDto> GetTeacherDashboardMetricsByUserIdAsync(string userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<Teacher> GetTeacherByUserIdAsync(string userId);
    }
}
