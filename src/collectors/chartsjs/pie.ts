import type { Accessor } from "../../types";
import { resolve } from "../../utils";
import {
  type ChartJsBaseDataset,
  type ChartJsOutput,
  resolveColor,
} from "./common";

export interface ChartJsPieDataset<T> extends ChartJsBaseDataset<T> {
  dataKey: Accessor<T, number>;
  hoverOffset?: number;
}

export interface ChartJsPieConfig<T> {
  labelKey: Accessor<T, string>;
  datasets: ChartJsPieDataset<T>[];
}

interface PieDatasetOutput {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  hoverOffset?: number;
}

export const ToChartJsPie =
  <T>(config: ChartJsPieConfig<T>) =>
  (items: T[]): ChartJsOutput<PieDatasetOutput> => {
    const labels = items.map((item) => resolve(item, config.labelKey));

    const datasets = config.datasets.map((ds) => {
      return {
        label: ds.label,
        data: items.map((item) => resolve(item, ds.dataKey)),
        backgroundColor: resolveColor(ds.backgroundColor, items),
        borderColor: resolveColor(ds.borderColor, items),
        borderWidth: ds.borderWidth ?? 1,
        hoverOffset: ds.hoverOffset ?? 4,
      };
    });

    return { labels, datasets };
  };
