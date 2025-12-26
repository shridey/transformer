import type { Accessor } from "../../types";
import { resolve } from "../../utils";

/**
 * Helper type: A color can be a static string, an array of strings,
 * OR an Accessor that resolves to a string per item.
 */
export type ColorConfig<T> = string | string[] | Accessor<T, string>;

export interface ChartJsBaseDataset<T> {
  label: string;
  backgroundColor?: ColorConfig<T>;
  borderColor?: ColorConfig<T>;
  borderWidth?: number;
}

export interface ChartJsOutput<D> {
  labels: string[];
  datasets: D[];
}

/**
 * Shared helper to resolve color configs.
 * Handles ambiguity: If it's a static string/array, return it.
 * If it's a function or a key exists in data, map it.
 */
export function resolveColor<T>(
  config: ColorConfig<T> | undefined,
  items: T[]
): string | string[] | undefined {
  if (!config) return undefined;

  // Case 1: Array -> Static config (e.g. ['red', 'blue'])
  if (Array.isArray(config)) return config;

  // Case 2: Function -> Accessor (Computed per item)
  if (typeof config === "function") {
    return items.map((item) => (config as (t: T) => string)(item));
  }

  // Case 3: String... ambiguous (Key or Color?)
  // FIX: Cast to Record<string, unknown> instead of 'any' to satisfy ESLint
  if (
    items.length > 0 &&
    typeof config === "string" &&
    config in (items[0] as Record<string, unknown>)
  ) {
    return items.map((item) => resolve(item, config as Accessor<T, string>));
  }

  // Fallback: Static string
  return config as string;
}
