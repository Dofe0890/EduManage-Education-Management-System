using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.FilterDTOs;
using StudentDataAccessLayer.Models;

namespace StudentBusinessLayer.Interfaces
{
    public interface IStudentService
    {
        Task<Student> GetStudentById(int id);
        Task EditStudent(int id, StudentDTO UpdatedStudent);
        Task DeleteStudent(int id);
        Task<Student> AddNewStudent(Student student);
        Task<(IEnumerable<Student> Items, int TotalCount)> GetStudents(StudentFilterDTO filter);
        Task<Student> SoftDeleteStudent(int id);
        Task<IEnumerable<Student>> GetActiveStudents();
        Task<IEnumerable<Student>> GetStudentsByStatus(StudentStatus status);
    }
}
