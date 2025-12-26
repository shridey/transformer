import type { Accessor } from "../../types";
import { resolve } from "../../utils";

export interface RechartsScatterDatum<T> {
  x: number;
  y: number;
  z?: number;
  payload: T;
}

export interface RechartsScatterConfig<T> {
  xKey: Accessor<T, number>;
  yKey: Accessor<T, number>;
  zKey?: Accessor<T, number>; // Z-Axis / Bubble Size
}

export const ToRechartsScatter =
  <T>(config: RechartsScatterConfig<T>) =>
  (items: T[]): RechartsScatterDatum<T>[] => {
    return items.map((item) => ({
      x: resolve(item, config.xKey),
      y: resolve(item, config.yKey),
      z: config.zKey ? resolve(item, config.zKey) : undefined,
      payload: item,
    }));
  };
