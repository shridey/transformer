import type { Accessor } from "../../types";
import { resolve } from "../../utils";

export interface NivoPieDatum<T> {
  id: string;
  label: string;
  value: number;
  color?: string;
  data: T; // Embed original data for custom tooltips
}

export interface NivoPieConfig<T> {
  idKey: Accessor<T, string>;
  valueKey: Accessor<T, number>;
  labelKey?: Accessor<T, string>;
  colorKey?: Accessor<T, string>;
}

export const ToNivoPie =
  <T>(config: NivoPieConfig<T>) =>
  (items: T[]): NivoPieDatum<T>[] => {
    return items.map((item) => ({
      id: resolve(item, config.idKey),
      label: resolve(item, config.labelKey || config.idKey),
      value: resolve(item, config.valueKey),
      color: config.colorKey ? resolve(item, config.colorKey) : undefined,
      data: item, // Preserve full item in 'data' property
    }));
  };
