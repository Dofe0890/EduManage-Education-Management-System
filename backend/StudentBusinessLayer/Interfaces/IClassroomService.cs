using StudentBusinessLayer.FilterDTOs;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.Interfaces
{
    public interface IClassroomService
    {
        Task<Classroom> CreateClassroomAsync(Classroom classroom);
        Task AssignTeacherAsync(int classroomId, int teacherId);
        Task<(IEnumerable<Classroom> Items, int TotalCount)> GetAllClassesAsync(ClassroomFilterDTO filter);
        Task<Classroom> GetClassByIdWithDetails(int classroomId);
        Task<IEnumerable<Classroom>> GetClassesByName(string name);
        Task DeleteClassroomAsync(int classroomId);
        Task EditClassroomAsync(int classroomId, string newClassroomName);
    }
}
