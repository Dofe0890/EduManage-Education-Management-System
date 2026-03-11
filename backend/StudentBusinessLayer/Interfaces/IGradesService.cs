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
    public interface IGradesService
    {
        Task<IEnumerable<Grade>> GetGradesAsync(GradeFilterDTO filter);
        Task<Grade> GetGradeByIdAsync(int gradeId);
        Task<Grade> AddGradeAsync(Grade grade);
        Task UpdateGradeAsync(int gradeId, EditGradeDTO updatedGrade);
        Task DeleteGradeAsync(int gradeId);

    }
}
