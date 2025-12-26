import type { Accessor } from "../../types";
import { resolve } from "../../utils";

export interface RechartsBarConfig<T> {
  xAxisKey: Accessor<T, string>;
}

/**
 * Recharts is flexible. We mainly ensure the X-Axis key is present as 'name'
 * (standard convention) or preserved, while keeping T intact.
 */
export const ToRechartsBar =
  <T>(config: RechartsBarConfig<T>) =>
  (items: T[]): (T & { name: string })[] => {
    return items.map((item) => ({
      ...item,
      name: resolve(item, config.xAxisKey),
    }));
  };
