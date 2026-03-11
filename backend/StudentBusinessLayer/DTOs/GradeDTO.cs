using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace StudentBusinessLayer.DTOs
{
    public class GradeDTO
    {
        public int id { get; set; }

        [Required]
        public int studentId { get; set; }

        [Required]
        public int subjectId { get; set; }

        [Required]
        public int teacherId { get; set; }

        [Range(0, 100)]
        public double score { get; set; }

        public DateTime dateGrade { get; set; } = DateTime.Now;
    }
}
