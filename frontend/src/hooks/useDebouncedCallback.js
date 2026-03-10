import { useRef, useCallback } from "react";

/**
 * Returns a stable callback that invokes the given function after a delay.
 * Resets the timer on each call (debounce). Useful for search inputs.
 *
 * @param {Function} fn - Function to debounce (e.g. (value) => void)
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function useDebouncedCallback(fn, delayMs) {
  const timeoutRef = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const debounced = useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fnRef.current(...args);
        timeoutRef.current = null;
      }, delayMs);
    },
    [delayMs],
  );

  return debounced;
}

export default useDebouncedCallback;
