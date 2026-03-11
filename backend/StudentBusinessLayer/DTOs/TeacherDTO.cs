using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace StudentBusinessLayer.DTOs
{
    public class TeacherDTO
    {
        public int? id { get; set; }

        public string? name { get; set; }
 [EmailAddress]
        public string? email { get; set; }
        public string? userId { get; set; }

        public int? subjectId { get; set; }

    }
}
