import type { Accessor, Comparable } from "../types";

/**
 * Resolves an Accessor to a value.
 * Handles both "string key" and "function" accessors safely.
 */
export function resolve<T, R>(item: T, accessor: Accessor<T, R>): R {
  if (typeof accessor === "function") {
    // Cast to specific function signature to satisfy no-unsafe-function-type
    return (accessor as (item: T) => R)(item);
  }
  // Safe casting: KeysMatching in Accessor<T, R> guarantees this key exists and matches R
  return item[accessor as keyof T] as unknown as R;
}

// --- SORT --------------------------------------------------------
export const Sort = {
  asc:
    <T>(accessor: Accessor<T, Comparable>) =>
    (a: T, b: T) => {
      const valA = resolve(a, accessor);
      const valB = resolve(b, accessor);
      if (valA > valB) return 1;
      if (valA < valB) return -1;
      return 0;
    },

  desc:
    <T>(accessor: Accessor<T, Comparable>) =>
    (a: T, b: T) => {
      const valA = resolve(a, accessor);
      const valB = resolve(b, accessor);
      if (valA < valB) return 1;
      if (valA > valB) return -1;
      return 0;
    },
};

// --- FILTER ------------------------------------------------------
export const Filter = {
  eq:
    <T>(accessor: Accessor<T, unknown>, value: unknown) =>
    (item: T) => {
      return resolve(item, accessor) === value;
    },

  gt:
    <T>(accessor: Accessor<T, number>, value: number) =>
    (item: T) => {
      return (resolve(item, accessor) as number) > value;
    },

  lt:
    <T>(accessor: Accessor<T, number>, value: number) =>
    (item: T) => {
      return (resolve(item, accessor) as number) < value;
    },

  includes:
    <T>(accessor: Accessor<T, string>, value: string) =>
    (item: T) => {
      const val = resolve(item, accessor);
      return typeof val === "string" && val.includes(value);
    },
};

// --- AGGREGATE ---------------------------------------------------
export const Aggregate = {
  sum: <T>(accessor: Accessor<T, number>, items: T[]): number => {
    return items.reduce((acc, item) => acc + (resolve(item, accessor) || 0), 0);
  },

  sumIf: <T>(
    accessor: Accessor<T, number>,
    items: T[],
    predicate: (item: T) => boolean
  ): number => {
    return items.reduce((acc, item) => {
      return predicate(item) ? acc + (resolve(item, accessor) || 0) : acc;
    }, 0);
  },

  avg: <T>(accessor: Accessor<T, number>, items: T[]): number => {
    if (items.length === 0) return 0;
    const total = items.reduce(
      (acc, item) => acc + (resolve(item, accessor) || 0),
      0
    );
    return total / items.length;
  },

  avgIf: <T>(
    accessor: Accessor<T, number>,
    items: T[],
    predicate: (item: T) => boolean
  ): number => {
    let sum = 0;
    let count = 0;
    for (const item of items) {
      if (predicate(item)) {
        sum += resolve(item, accessor) || 0;
        count++;
      }
    }
    return count === 0 ? 0 : sum / count;
  },

  count: <T>(items: T[]): number => items.length,

  countIf: <T>(items: T[], predicate: (item: T) => boolean): number => {
    return items.reduce((acc, item) => (predicate(item) ? acc + 1 : acc), 0);
  },

  // FIX: Switched to loop to prevent Stack Overflow on large datasets
  max: <T>(accessor: Accessor<T, number>, items: T[]): number => {
    if (items.length === 0) return 0;
    let maxVal = -Infinity;
    for (const item of items) {
      const val = resolve(item, accessor);
      if (val > maxVal) maxVal = val;
    }
    return maxVal;
  },

  // FIX: Switched to loop to prevent Stack Overflow on large datasets
  min: <T>(accessor: Accessor<T, number>, items: T[]): number => {
    if (items.length === 0) return 0;
    let minVal = Infinity;
    for (const item of items) {
      const val = resolve(item, accessor);
      if (val < minVal) minVal = val;
    }
    return minVal;
  },
};
