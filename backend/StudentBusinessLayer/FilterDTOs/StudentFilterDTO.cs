using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.FilterDTOs
{
    public class StudentFilterDTO:BaseFilterDTO
    {
        
        public string? name { get; set; }

        public int? age { get; set; }

        public int? classroomId { get; set; }

        public StudentStatus? status { get; set; }
    }
}
