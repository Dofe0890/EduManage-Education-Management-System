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
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;

        public BaseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<T> AddRecordAsync(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            await _context.Set<T>().AddAsync(entity);
            return entity;
        }

        public virtual async Task<bool> DeleteByIdAsync(int id)
        {
            var entity = await _context.Set<T>().FindAsync(id);


            if (entity == null)
            {
                return false;
            }
            _context.Set<T>().Remove(entity);

            return true;
        }


        public async Task<T?> GetByIDAsync(int id)
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task<bool> UpdateAsync(T entity)
        { 
            _context.Set<T>().Update(entity);
            await Task.CompletedTask;
            return true;
        }

        public async Task<T> FindAsync(Expression<Func<T, bool>> criteria)
        {
            return await _context.Set<T>().FirstOrDefaultAsync(criteria); 
        }



        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            return await _context.Set<T>().AnyAsync(predicate);
        }

        public async Task<int> Count(int id)
        {
            return await _context.Set<T>().CountAsync();
        }

        public async Task<int> Count(Expression<Func<T, bool>> predicate)
        {
            return await _context.Set<T>().CountAsync(predicate);
        }

        public IQueryable<T> Query()
        {
            return _context.Set<T>().AsNoTracking();
        }

        public Task<List<T>> ToListAsync()
        {
            return _context.Set<T>().ToListAsync();
        }
    }
}
