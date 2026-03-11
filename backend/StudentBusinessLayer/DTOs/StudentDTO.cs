using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.DTOs
{
    public class StudentDTO
    {
        public int id { get; set; }

        [Required]
        [MinLength(2)]
        public string name { get; set; }

        [Range(6, 100)]
        public int age { get; set; }
        
        [Required]
        public int classroomId { get; set; }

        // Audit fields (matching database schema)
        public bool status { get; set; } = true; // true = Active, false = Inactive
        public DateTime createdAt { get; set; }
        public DateTime updatedAt { get; set; }
    }

    public class StudentCreateDTO
    {
        [Required]
        [MinLength(2)]
        public string name { get; set; }

        [Range(6, 100)]
        public int age { get; set; }
        
        [Required]
        public int classroomId { get; set; }
    }

    public class StudentUpdateDTO
    {
        [Required]
        [MinLength(2)]
        public string name { get; set; }

        [Range(6, 100)]
        public int age { get; set; }
        
        [Required]
        public int classroomId { get; set; }

        public bool? status { get; set; }
    }
}
