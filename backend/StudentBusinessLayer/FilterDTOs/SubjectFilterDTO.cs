using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.FilterDTOs
{
    public class SubjectFilterDTO:BaseFilterDTO
    {
      
        public string? name { get; set; }

    }
}
