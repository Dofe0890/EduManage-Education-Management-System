using System;

namespace StudentBusinessLayer.DTOs
{
    public class TeacherDashboardMetricsDto
    {
        public SubjectDTO Subject { get; set; }
        public ClassAverageDto HighestClassAverage { get; set; }
        public ClassAttendanceDto HighestAttendanceClass { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class ClassAverageDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; }
        public double AverageGrade { get; set; }
    }

    public class ClassAttendanceDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; }
        public double AttendancePercentage { get; set; }
        public int PresentCount { get; set; }
        public int TotalRecords { get; set; }
    }
}
