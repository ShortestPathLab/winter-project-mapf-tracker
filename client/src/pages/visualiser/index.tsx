import { Box, Button, Stack, Typography } from "@mui/material";
import { useMd } from "components/dialog/useSmallDisplay";
import { Surface } from "components/surface";
import { useStableLocationState } from "hooks/useStableLocationState";
import { BentoLayout } from "layout/BentoLayout";
import { topbarHeight } from "layout/topbarHeight";
import { startCase } from "lodash";
import { bindTrigger } from "material-ui-popup-state";
import Details from "pages/benchmarks-scenario-level/Details";
import pluralize from "pluralize";
import { useMapData, useScenario } from "queries/useMapQuery";
import { useInstance } from "queries/useInstanceQuery";
import Visualiser from "./Visualiser";
import { VisualiserLocationState } from "./VisualiserLocationState";

export { default as Visualiser } from "./Visualiser";

export default function index() {
  const md = useMd();
  const state = useStableLocationState<VisualiserLocationState>();
  const { data: instanceData } = useInstance(state.instanceId);
  const { data: scenarioData } = useScenario(instanceData?.scen_id);
  const { data: mapData } = useMapData(instanceData?.map_id);
  const scenarioString = scenarioData
    ? startCase(`${scenarioData?.scen_type}-${scenarioData?.type_id}`)
    : "--";
  const title = instanceData
    ? pluralize("agent", instanceData?.agents ?? 0, true)
    : "--";
  return (
    <BentoLayout
      title={title}
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
        {
          name: mapData ? startCase(mapData?.map_name) : "--",
          url: "/scenarios",
          state,
        },
        {
          name: scenarioString,
          url: "/instances",
          state,
        },
      ]}
      labelLeft="Instance details"
      contentLeft={
        <Stack sx={{ gap: 4 }}>
          <Details id={state.instanceId} />
        </Stack>
      }
      labelRight="Best solution"
      contentRight={
        md ? (
          <Surface
            variant="fullscreen"
            slotProps={{
              appBar: {
                sx: {
                  background: "transparent",
                  width: "fit-content",
                },
              },
            }}
            trigger={(state) => (
              <Button {...bindTrigger(state)} variant="contained">
                Open visualiser
              </Button>
            )}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100dvh",
              }}
            >
              <Visualiser />
            </Box>
          </Surface>
        ) : (
          <Stack sx={{ overflow: "hidden" }}>
            <Box
              sx={{
                overflow: "hidden",
                bgcolor: "background.paper",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: `calc(100dvh - ${topbarHeight(false) + 8 + 1}px)`,
              }}
            >
              <Visualiser />
            </Box>
            <Typography
              variant="h2"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                p: 3,
              }}
            >
              Best solution
            </Typography>
          </Stack>
        )
      }
    />
  );
}
