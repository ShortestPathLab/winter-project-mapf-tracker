import { useTheme } from "@mui/material";
import {
  capitalize,
  filter,
  get,
  head,
  isNumber,
  map,
  max,
  startCase,
} from "lodash";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Label,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { paper } from "theme";
import { toneBy } from "utils/colors";
import { stateOfTheArt } from "./ChartOptions";
import { Slice } from "./useAlgorithmSelector";

const Charts = {
  bar: { chart: BarChart, series: Bar },
  line: { chart: LineChart, series: Line },
  area: { chart: AreaChart, series: Area },
};

export const SliceChart = ({
  slice,
  type = "bar",
  stacked,
  selected,
  xAxisDataKey = "name",
  keyType = "id",
  stateOfTheArt: stateOfTheArtEnabled,
  ...props
}: {
  xAxisDataKey?: string;
  keyType?: "id" | "name";
  slice: Slice;
  selected: string[];
  type?: "bar" | "area" | "line";
  stacked?: boolean;
  stateOfTheArt?: boolean;
} & { data?: unknown[] }) => {
  const { data: algorithms = [] } = useAlgorithmsData();
  const algorithms1 = stateOfTheArtEnabled
    ? [stateOfTheArt, ...algorithms]
    : algorithms;
  const { chart: Chart, series: _Series } = Charts[type];
  const Series = _Series as unknown as React.FC<Record<string, unknown>>;
  const theme = useTheme();
  return (
    <Chart barCategoryGap={4} barGap={0} {...props}>
      <Legend />
      <Tooltip
        formatter={slice?.formatter}
        contentStyle={{ border: paper(0).border(theme) }}
        cursor={{ fill: theme.palette.action.disabledBackground }}
      />
      <YAxis
        domain={slice?.domain as AxisDomain}
        tickFormatter={(v) => slice?.formatter?.(v) ?? v}
        label={
          <Label
            position="insideLeft"
            value={slice?.name ?? "Instance count"}
            angle={-90}
            style={{ textAnchor: "middle" }}
          />
        }
      />
      <XAxis
        dataKey={xAxisDataKey}
        type={
          isNumber(get(head(props.data), xAxisDataKey)) ? "number" : "category"
        }
        label={capitalize(startCase(xAxisDataKey))}
        angle={-45}
        textAnchor="end"
        height={
          max(map(props.data, (d) => `${get(d, xAxisDataKey)}`.length)) * 4 + 90
        }
      />
      {map(
        filter(
          algorithms1,
          (a) => !selected.length || selected.includes(a._id)
        ),
        (algorithm, i) => (
          <Series
            {...(algorithm === stateOfTheArt
              ? {
                  fill: theme.palette.primary.main,
                  fillOpacity: 0.1,
                  stroke: theme.palette.primary.main,
                }
              : {
                  fill: toneBy(theme.palette.mode, i),
                  stroke: toneBy(theme.palette.mode, i),
                  fillOpacity: {
                    area: 0.25,
                    line: 0,
                    bar: 0.75,
                  }[type],
                })}
            isAnimationActive={false}
            dataKey={`${
              keyType === "name" ? algorithm.algo_name : algorithm._id
            }.${slice?.key}`}
            name={algorithm.algo_name}
            stackId={stacked ? "1" : undefined}
          />
        )
      )}
    </Chart>
  );
};
