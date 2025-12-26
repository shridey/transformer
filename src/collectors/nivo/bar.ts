import type { Accessor } from "../../types";
import { resolve } from "../../utils";

export interface NivoBarConfig<T> {
  indexKey: Accessor<T, string>;
  keys: Array<keyof T>;
}

/**
 * Returns an array of objects mixed with T.
 * We use Record<string, unknown> because Nivo bars have dynamic keys.
 */
export const ToNivoBar =
  <T>(config: NivoBarConfig<T>) =>
  (items: T[]): (T & Record<string, unknown>)[] => {
    return items.map((item) => {
      const indexValue = resolve(item, config.indexKey);

      // Explicitly construct the dynamic object
      const dynamicFields: Record<string, unknown> = {
        [config.indexKey as string]: indexValue,
      };

      config.keys.forEach((k) => {
        dynamicFields[k as string] = item[k];
      });

      // Spread original item to preserve all other fields for tooltips
      return { ...item, ...dynamicFields };
    });
  };
