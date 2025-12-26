import type { Accessor } from "../../types";
import { resolve } from "../../utils";

export interface RechartsLineConfig<T> {
  xAxisKey: Accessor<T, string | number>;
  lines: {
    dataKey: string; // The output key Recharts will bind to
    accessor: Accessor<T, number>;
  }[];
}

export const ToRechartsLine =
  <T>(config: RechartsLineConfig<T>) =>
  (items: T[]): (T & Record<string, unknown>)[] => {
    return items.map((item) => {
      const output: Record<string, unknown> = {
        name: resolve(item, config.xAxisKey), // Standard Recharts X-Axis key
      };

      config.lines.forEach((line) => {
        output[line.dataKey] = resolve(item, line.accessor);
      });

      // Spread original item for custom tooltips
      return { ...item, ...output };
    });
  };
