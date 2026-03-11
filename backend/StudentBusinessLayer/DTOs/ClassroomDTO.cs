using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.DTOs
{
    public class ClassroomDTO
    {
        public int id { get; set; }

        [Required]
        [MinLength(2)]
        public string name { get; set; }
    }
}
