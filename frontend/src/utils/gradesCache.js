/**
 * Shared grades cache utility module.
 * This prevents stale data issues by providing a centralized cache management.
 */

/**
 * LOCAL CACHE: Deduplicate identical requests (prevents double-fetch in StrictMode or rapid navigation).
 * OPTIMIZATION: Prevents memory leak by clearing cache when it exceeds 50 entries.
 */
const _gradesCache = new Map();
const MAX_CACHE_SIZE = 50;

/**
 * Clear local cache - call this when grades are modified
 * This ensures the cache doesn't return stale data after edit/delete operations
 */
export const clearGradesCache = () => {
  console.log("🗑️ Clearing grades local cache due to data modification");
  _gradesCache.clear();
};

/**
 * Get cache size for debugging
 */
export const getGradesCacheSize = () => {
  return _gradesCache.size;
};

/**
 * Normalizes API response to { data, totalCount }.
 * Includes local caching to deduplicate requests with LRU-style cleanup.
 */
export const fetchGradesWithCache = async (params, fetchFn) => {
  const obj = Object.fromEntries(params.entries());
  const cacheKey = JSON.stringify(obj);

  // OPTIMIZATION: Clear cache if it exceeds max size to prevent memory leak
  if (_gradesCache.size > MAX_CACHE_SIZE) {
    _gradesCache.clear();
  }

  // Return from local cache if available
  if (_gradesCache.has(cacheKey)) {
    console.log("📦 Cache HIT for:", cacheKey);
    return _gradesCache.get(cacheKey);
  }

  // Fetch from API
  console.log("🌐 Cache MISS for:", cacheKey);
  const result = await fetchFn(params);

  // Store in cache
  _gradesCache.set(cacheKey, result);

  return result;
};
