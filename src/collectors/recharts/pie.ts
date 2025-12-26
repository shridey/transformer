import type { Accessor } from "../../types";
import { resolve } from "../../utils";

export interface RechartsPieDatum<T> {
  name: string;
  value: number;
  fill?: string;
  payload: T; // Recharts stores original data in 'payload'
}

export interface RechartsPieConfig<T> {
  nameKey: Accessor<T, string>;
  dataKey: Accessor<T, number>;
  fillKey?: Accessor<T, string>;
}

export const ToRechartsPie =
  <T>(config: RechartsPieConfig<T>) =>
  (items: T[]): RechartsPieDatum<T>[] => {
    return items.map((item) => ({
      name: resolve(item, config.nameKey),
      value: resolve(item, config.dataKey),
      fill: config.fillKey ? resolve(item, config.fillKey) : undefined,
      payload: item,
    }));
  };
