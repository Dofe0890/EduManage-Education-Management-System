using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentDataAccessLayer.Models
{
    public class Student
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ClassroomId { get; set; }
        public Classroom Classroom { get; set; }
        public int Age { get; set; }
        public ICollection<Grade> Grade { get; set; }

        // Audit fields for soft delete and tracking
        public bool Status { get; set; } = true; // true = Active, false = Inactive (matches database bit type)
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public enum StudentStatus
    {
        Active = 1,
        Inactive = 0
    }
}
