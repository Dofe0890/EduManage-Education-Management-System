using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.DTOs
{
    public class TeacherWithDetailsDTO
    {
        public int id { get; set; }

        public string name { get; set; }

        public string userId { get; set; }

        public string email { get; set; }

        public int subjectId { get; set; }

        public string subjectName { get; set; }

        public Subject Subject { get; set; }

        public IEnumerable<ClassroomDTO> TeacherAssignedClasses { get; set; }
    }
}
