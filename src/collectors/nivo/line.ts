import type { Accessor } from "../../types";
import { resolve } from "../../utils";

export interface NivoLinePoint<T> {
  x: string | number;
  y: number;
  data: T; // Embed original item
}

export interface NivoLineSeries<T> {
  id: string | number;
  data: NivoLinePoint<T>[];
}

export interface NivoLineConfig<T> {
  xKey: Accessor<T, string | number>;
  lines: {
    id: string;
    dataKey: Accessor<T, number>;
  }[];
}

export const ToNivoLine =
  <T>(config: NivoLineConfig<T>) =>
  (items: T[]): NivoLineSeries<T>[] => {
    return config.lines.map((line) => ({
      id: line.id,
      data: items.map((item) => ({
        x: resolve(item, config.xKey),
        y: resolve(item, line.dataKey),
        data: item, // Preserve original
      })),
    }));
  };
