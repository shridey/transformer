import type { Accessor } from "../../types";
import { resolve } from "../../utils";
import {
  type ChartJsBaseDataset,
  type ChartJsOutput,
  resolveColor,
} from "./common";

export interface ChartJsLineDataset<T> extends ChartJsBaseDataset<T> {
  dataKey: Accessor<T, number>;
  tension?: number;
  fill?: boolean;
  pointRadius?: number;
}

export interface ChartJsLineConfig<T> {
  labelKey: Accessor<T, string>;
  datasets: ChartJsLineDataset<T>[];
}

interface LineDatasetOutput {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  fill?: boolean;
  pointRadius?: number;
}

export const ToChartJsLine =
  <T>(config: ChartJsLineConfig<T>) =>
  (items: T[]): ChartJsOutput<LineDatasetOutput> => {
    const labels = items.map((item) => resolve(item, config.labelKey));

    const datasets = config.datasets.map((ds) => {
      return {
        label: ds.label,
        data: items.map((item) => resolve(item, ds.dataKey)),
        backgroundColor: resolveColor(ds.backgroundColor, items),
        borderColor: resolveColor(ds.borderColor, items),
        borderWidth: ds.borderWidth ?? 2,
        tension: ds.tension ?? 0.4,
        fill: ds.fill ?? false,
        pointRadius: ds.pointRadius ?? 3,
      };
    });

    return { labels, datasets };
  };
