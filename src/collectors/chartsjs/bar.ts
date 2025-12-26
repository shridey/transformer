import type { Accessor } from "../../types";
import { resolve } from "../../utils";
import {
  type ChartJsBaseDataset,
  type ChartJsOutput,
  resolveColor,
} from "./common";

export interface ChartJsBarDataset<T> extends ChartJsBaseDataset<T> {
  dataKey: Accessor<T, number>;
  stack?: string;
  barPercentage?: number;
  categoryPercentage?: number;
}

export interface ChartJsBarConfig<T> {
  labelKey: Accessor<T, string>;
  datasets: ChartJsBarDataset<T>[];
}

interface BarDatasetOutput {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  stack?: string;
  barPercentage?: number;
  categoryPercentage?: number;
}

export const ToChartJsBar =
  <T>(config: ChartJsBarConfig<T>) =>
  (items: T[]): ChartJsOutput<BarDatasetOutput> => {
    const labels = items.map((item) => resolve(item, config.labelKey));

    const datasets = config.datasets.map((ds) => {
      return {
        label: ds.label,
        data: items.map((item) => resolve(item, ds.dataKey)),
        backgroundColor: resolveColor(ds.backgroundColor, items),
        borderColor: resolveColor(ds.borderColor, items),
        borderWidth: ds.borderWidth ?? 1,
        stack: ds.stack,
        barPercentage: ds.barPercentage,
        categoryPercentage: ds.categoryPercentage,
      };
    });

    return { labels, datasets };
  };
