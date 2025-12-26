import type { Accessor } from "../../types";
import { resolve } from "../../utils";
import {
  type ChartJsBaseDataset,
  type ChartJsOutput,
  resolveColor,
} from "./common";

export interface ChartJsScatterDataset<T> extends ChartJsBaseDataset<T> {
  xKey: Accessor<T, number>;
  yKey: Accessor<T, number>;
  pointRadius?: number;
}

export interface ChartJsScatterConfig<T> {
  datasets: ChartJsScatterDataset<T>[];
}

interface ScatterPoint {
  x: number;
  y: number;
}

interface ScatterDatasetOutput {
  label: string;
  data: ScatterPoint[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  pointRadius?: number;
}

export const ToChartJsScatter =
  <T>(config: ChartJsScatterConfig<T>) =>
  (items: T[]): ChartJsOutput<ScatterDatasetOutput> => {
    const labels: string[] = []; // Scatter charts imply axes

    const datasets = config.datasets.map((ds) => {
      return {
        label: ds.label,
        data: items.map((item) => ({
          x: resolve(item, ds.xKey),
          y: resolve(item, ds.yKey),
        })),
        backgroundColor: resolveColor(ds.backgroundColor, items),
        borderColor: resolveColor(ds.borderColor, items),
        borderWidth: ds.borderWidth ?? 1,
        pointRadius: ds.pointRadius ?? 5,
      };
    });

    return { labels, datasets };
  };
