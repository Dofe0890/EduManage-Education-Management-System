namespace StudentBusinessLayer.FilterDTOs
{

public class AttendanceFilterDTO:BaseFilterDTO
{

    public int? studentId { get; set; }

    public DateTime? fromDate { get; set; } 

    public DateTime? toDate { get; set; }

     public bool? isPresent { get; set; } = true;



    }
}




