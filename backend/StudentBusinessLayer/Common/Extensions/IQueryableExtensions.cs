using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using StudentDataAccessLayer;
namespace StudentBusinessLayer.Common.Extensions
{

public static class IQueryableExtensions
{
    public static IQueryable<T> ApplyPagination<T> (this IQueryable<T> query, int page, int limit)
    {
        page = page <= 0 ? 1 : page;
        limit = limit <= 0 ? 20 : limit;
        return query.Skip((page -1 ) * limit).Take(limit); 
    } 
    
    public static IQueryable<T> ApplySorting<T> (this IQueryable<T> query, string? orderBy , bool desc)
    {
        if (string.IsNullOrWhiteSpace(orderBy))
        return query;

        return desc ? query.OrderByDescending(e => EF.Property<object>(e, orderBy)) :
            query.OrderBy(e => EF.Property<object>(e, orderBy));


    }
}
}
