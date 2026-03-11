using System.Linq;
namespace StudentDataAccessLayer.DTOs.Common {

    public class PagedResult<T>
    {
        public IReadOnlyList<T> Items { get; init; } = [];
        public int TotalCount { get; init; } = 0;
    }

}

