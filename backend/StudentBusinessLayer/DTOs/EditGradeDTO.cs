using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace StudentBusinessLayer.DTOs
{
    public class EditGradeDTO
    {
        public int? id { get; set; }

        
        public int? studentId { get; set; }

        
        public int? subjectId { get; set; }

       
        public int? teacherId { get; set; }

        public double? score { get; set; }

        public DateTime? dateGrade { get; set; } = DateTime.Now;
    }
}