export type Mapper<T, U> = (item: T) => U;
export type Predicate<T> = (item: T) => boolean;
export type Comparator<T> = (a: T, b: T) => number;
export type Comparable = string | number | boolean | Date;
// Utility type for constructing objects with dynamic keys safely
export type Dictionary<V = unknown> = Record<string, V>;
export interface Group<K, T> {
  key: K;
  items: T[];
}
/**
 * Utility type to extract keys where the value matches a specific type.
 */
export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

/**
 * A flexible accessor: can be a direct key string OR a function.
 */
export type Accessor<T, R> = KeysMatching<T, R> | ((item: T) => R);
