import { RouteOutlined } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { IconCard } from "components/IconCard";
import { Item } from "components/Item";
import { isUndefined, startCase } from "lodash";
import pluralize from "pluralize";
import { useScenarioData } from "queries/useBenchmarksQuery";

export function ScenarioLabel({
  scenarioId,
  count,
}: {
  scenarioId: string;
  count?: number;
}) {
  const { data } = useScenarioData(scenarioId);
  return (
    <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
      <Stack sx={{ width: 48, alignItems: "center" }}>
        <IconCard icon={<RouteOutlined />} />
      </Stack>
      <Item
        primary={`${startCase(data?.scen_type ?? "-")}-${data?.type_id ?? "-"}`}
        secondary={
          isUndefined(count) ? "Scenario" : pluralize("item", count, true)
        }
      />
    </Stack>
  );
}
