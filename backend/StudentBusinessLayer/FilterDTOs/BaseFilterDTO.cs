namespace StudentBusinessLayer.FilterDTOs
{


public abstract class BaseFilterDTO {

    public int page { get; set; } = 1;
    public int limit { get; set; } = 10;
    public string? orderBy { get; set; } = "Id";
    public bool isDescending { get; set; } = false;

}
}