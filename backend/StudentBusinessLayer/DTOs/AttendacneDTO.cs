using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace StudentBusinessLayer.DTOs
{
    public enum AttendanceStatus
    {
        Present,
        Absent,
        Excused
    }
    public class AttendanceDTO
    {
        public int id { get; set; }

        [Required]
        public int studentId { get; set; }

        public bool isPresent { get; set; } = true;

        public DateTime date { get; set; } = DateTime.Now;

        public AttendanceStatus status { get; set; } = AttendanceStatus.Present;
    }
}
