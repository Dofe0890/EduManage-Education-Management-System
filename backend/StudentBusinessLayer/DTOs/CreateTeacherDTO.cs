using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace StudentBusinessLayer.DTOs
{
    
        public class CreateTeacherDTO
        {
            public int id { get; set; }

            [Required]
            [MinLength(2)]
            public string name { get; set; }
        [Required]
        [MinLength(2)]
        public string email { get; set; }
        [Required]
        [MinLength(2)]
        public string userId { get; set; }

            [Required]
            public int subjectId { get; set; }

        }
    

}
