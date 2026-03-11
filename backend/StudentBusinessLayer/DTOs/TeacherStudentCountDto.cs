using System;
using System.Collections.Generic;

namespace StudentBusinessLayer.DTOs
{
    public class TeacherStudentCountDto
    {
        public int TeacherId { get; set; }
        public string TeacherName { get; set; }
        public int TotalStudents { get; set; }
        public int TotalClasses { get; set; }
        public DateTime LastUpdated { get; set; }
        public List<ClassStudentCountDto> ClassBreakdown { get; set; } = new List<ClassStudentCountDto>();
    }

    public class ClassStudentCountDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; }
        public string Subject { get; set; }
        public int StudentCount { get; set; }
    }
}
