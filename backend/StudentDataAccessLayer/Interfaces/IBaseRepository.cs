using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Expressions;
namespace StudentDataAccessLayer.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        Task<T?> GetByIDAsync(int id);
        Task<T> AddRecordAsync(T entity);
        Task<bool> DeleteByIdAsync(int id);
        Task<bool> UpdateAsync(T entity);
        Task<T> FindAsync(Expression<Func<T, bool>> criteria);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
        Task<int> Count(int id);
        Task<int> Count(Expression<Func<T, bool>> predicate);
        IQueryable<T> Query();
        Task<List<T>> ToListAsync();


    }
}
