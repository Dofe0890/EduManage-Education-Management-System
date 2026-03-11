namespace StudentBusinessLayer.DTOs;

/// <summary>
/// Standard paged API response. Serializes as { data, totalCount } for frontend.
/// </summary>
public class PagedResponse<T>
{
    public IEnumerable<T> Data { get; init; } = [];
    public int TotalCount { get; init; }
}
