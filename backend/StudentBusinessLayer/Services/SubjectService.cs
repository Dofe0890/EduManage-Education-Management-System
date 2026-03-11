using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.Interfaces;
using StudentDataAccessLayer.Interfaces;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentBusinessLayer.Common.Extensions;
using Microsoft.EntityFrameworkCore;
namespace StudentBusinessLayer.Services
{
    public class SubjectService:ISubjectService 
    {
        private readonly IUnitOfWork _unitOfWork;

        public SubjectService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Subject>> GetAllSubjectsAsync(SubjectFilterDTO filter)
        {
            filter.orderBy = filter.orderBy.FixAndValidateOrderBy();


            var query = _unitOfWork.Subjects.Query();

            if (!string.IsNullOrWhiteSpace(filter.name))
            {
                query = query.Where(a => EF.Functions.Like(a.Name, $"%{filter.name}%"));

            }


            query = query.ApplySorting(filter.orderBy, filter.isDescending);
            query = query.ApplyPagination(filter.page, filter.limit);


            return await query.ToListAsync(); 
        }

        public async Task<Subject> GetSubjectByIdAsync(int id)
        {
            return await _unitOfWork.Subjects.GetByIDAsync(id);
        }

        public async Task<Subject> GetSubjectByNameAsync(string name)
        {
            return await _unitOfWork.Subjects.FindAsync(s=>s.Name == name);
        }


    }
}
