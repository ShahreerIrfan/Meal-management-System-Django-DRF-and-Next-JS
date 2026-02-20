/**
 * useDebounce – delays a callback by `delay` ms.
 * Used for auto-save on the meal grid.
 */
import { useRef, useCallback } from "react";

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as unknown as T;

  return debounced;
}
