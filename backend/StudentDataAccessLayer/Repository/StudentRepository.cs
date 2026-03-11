using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using StudentDataAccessLayer.Interfaces;
using StudentDataAccessLayer.Models;

namespace StudentDataAccessLayer.Repository
{
    public interface IStudentRepository : IBaseRepository<Student>
    {
        Task<Student?> GetActiveStudentAsync(int id);
        Task<List<Student>> GetActiveStudentsAsync();
        Task<List<Student>> GetStudentsByStatusAsync(StudentStatus status);
    }

    public class StudentRepository : BaseRepository<Student>, IStudentRepository
    {
        public StudentRepository(ApplicationDbContext context) : base(context)
        {
        }

        // Note: Audit fields should be set in the business layer, not data access layer
        public new async Task<Student> AddRecordAsync(Student entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            await _context.Set<Student>().AddAsync(entity);
            return entity;
        }

        // Note: UpdatedAt should be set in the business layer, not data access layer
        public new async Task<bool> UpdateAsync(Student entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            _context.Set<Student>().Update(entity);
            await Task.CompletedTask;
            return true;
        }

        
        public async Task<Student?> GetActiveStudentAsync(int id)
        {
            return await _context.Set<Student>()
                .FirstOrDefaultAsync(s => s.Id == id && s.Status == true);
        }

        public async Task<List<Student>> GetActiveStudentsAsync()
        {
            return await _context.Set<Student>()
                .Where(s => s.Status == true)
                .ToListAsync();
        }

        public async Task<List<Student>> GetStudentsByStatusAsync(StudentStatus status)
        {
            bool statusValue = status == StudentStatus.Active;
            return await _context.Set<Student>()
                .Where(s => s.Status == statusValue)
                .ToListAsync();
        }
    }
}
