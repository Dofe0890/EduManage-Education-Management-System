namespace StudentBusinessLayer.FilterDTOs
{

    public class TeacherFilterDTO : BaseFilterDTO
    {

        public string? name { get; set; }

        public string? userId { get; set; }

        public int? subjectId { get; set; }

        public string? email { get; set; }



    }
}
