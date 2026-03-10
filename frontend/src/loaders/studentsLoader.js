import { queryKeys } from "../config/queryClient";
import { studentService } from "../services";

/**
 * Build same params object used by useTableData listParamsKey for cache hit.
 * Prefetch runs during navigation; useTableData reads from cache so no second request.
 */
function defaultListParams() {
  return { page: 1, limit: 10, orderBy: "", isDescending: false, f: "" };
}

function buildParamsFromKey(params) {
  const p = new URLSearchParams();
  p.set("page", String(params.page ?? 1));
  p.set("limit", String(params.limit ?? 10));
  if (params.orderBy) {
    p.set("orderBy", params.orderBy);
    p.set("isDescending", String(params.isDescending ?? false));
  }
  if (params.f) {
    new URLSearchParams(params.f).forEach((v, k) => p.set(k, v));
  }
  return p;
}

async function fetchStudentsForLoader(params) {
  const obj = Object.fromEntries(buildParamsFromKey(params).entries());
  const res = await studentService.getAll(obj);
  if (Array.isArray(res)) {
    return { data: res, totalCount: res.length };
  }
  return {
    data: res?.data ?? res?.items ?? [],
    totalCount: res?.totalCount ?? res?.total ?? res?.count ?? 0,
  };
}

/**
 * Prefetches first page of students into React Query cache.
 * StudentsPage useTableData uses queryKeyPrefix ['students', 'list'] with same key → cache hit, no double load.
 */
export function studentsLoader(queryClient) {
  return async () => {
    try {
      const params = defaultListParams();
      await queryClient.prefetchQuery({
        queryKey: queryKeys.studentsList(params),
        queryFn: () => fetchStudentsForLoader(params),
        staleTime: 2 * 60 * 1000,
      });
      return null;
    } catch (error) {
      throw new Response("Failed to load students", { status: 500 });
    }
  };
}
