import type { Accessor } from "../../types";
import { resolve } from "../../utils";

export interface NivoScatterPoint<T> {
  x: number;
  y: number;
  data: T;
}

export interface NivoScatterSeries<T> {
  id: string;
  data: NivoScatterPoint<T>[];
}

export interface NivoScatterConfig<T> {
  xKey: Accessor<T, number>;
  yKey: Accessor<T, number>;
  groupKey?: Accessor<T, string>;
}

export const ToNivoScatter =
  <T>(config: NivoScatterConfig<T>) =>
  (items: T[]): NivoScatterSeries<T>[] => {
    const groups = new Map<string, NivoScatterPoint<T>[]>();

    items.forEach((item) => {
      const groupId = config.groupKey
        ? String(resolve(item, config.groupKey))
        : "default";

      if (!groups.has(groupId)) groups.set(groupId, []);

      groups.get(groupId)!.push({
        x: resolve(item, config.xKey),
        y: resolve(item, config.yKey),
        data: item, // Preserve original
      });
    });

    return Array.from(groups.entries()).map(([id, data]) => ({
      id,
      data,
    }));
  };
