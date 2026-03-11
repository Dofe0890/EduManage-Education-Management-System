using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.FilterDTOs
{

    public enum GradeDateFilterType
    {
        Day,
        Month,
        Year
    }
    public class GradeFilterDTO:BaseFilterDTO
    {


        public int? studentId { get; set; }

        public int? subjectId { get; set; }

        public int? teacherId { get; set; }

        public double? minScore { get; set; }
        public double? maxScore { get; set; }
        public DateTime? dateGrade { get; set; }
        public GradeDateFilterType? dateFilterType { get; set; }

    }
}



