import { useTheme } from "@mui/material";
import { capitalize, chain, head } from "lodash";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { Chart } from "../../../components/analysis/Chart";
import {
  aggregateInstances,
  getInstanceAggregateProportions,
} from "../../../components/analysis/reducers";
import { successRateBarChartRenderer } from "../../../components/analysis/successRateBarChartRenderer";

export function MapProportionByDomainChart() {
  const { palette } = useTheme();
  const { data, isLoading } = useBenchmarksData();
  return (
    <Chart
      isLoading={isLoading}
      data={chain(data)
        .groupBy("map_name")
        .mapValues(aggregateInstances)
        .mapValues(getInstanceAggregateProportions)
        .mapValues((c) => ({
          ...c,
          type: head(c.collection)?.map_type,
          proportionSolved: c.proportionSolved - c.proportionClosed,
          proportionUnknown: 1 - c.proportionSolved,
        }))
        .entries()
        .map(([k, v]) => ({
          ...v,
          key: k,
          name: capitalize(k),
        }))
        .sortBy(["type", "proportionClosed"])
        .value()}
      render={successRateBarChartRenderer({ mode: palette.mode })}
    />
  );
}