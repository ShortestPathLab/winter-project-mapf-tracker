import { Box, Chip, MenuItem, Stack, TextField } from "@mui/material";
import { map } from "lodash";
import { setFromEvent } from "utils/set";
import { Slice, useAlgorithmSelector } from "./useAlgorithmSelector";
import { BaseMetric, metrics as defaultMetrics } from "core/metrics";

export default function ChartOptions({
  slices,
  algorithms,
  setSlice,
  slice,
  setMetric,
  metric,
  setSelected,
  selected,
  metrics = defaultMetrics,
}: {
  slices?: Slice[];
  algorithms?: string[];
  metrics?: BaseMetric[];
} & Partial<ReturnType<typeof useAlgorithmSelector>>) {
  return (
    <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
      {slices?.length > 1 && (
        <TextField
          select
          label="Slice"
          variant="filled"
          onChange={setFromEvent(setSlice)}
          value={slice.key}
        >
          {slices.map(({ key, name }) => (
            <MenuItem key={key} value={key}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      )}
      <TextField
        select
        label="Metric"
        variant="filled"
        onChange={setFromEvent(setMetric)}
        value={metric}
      >
        {metrics.map(({ key, name }) => (
          <MenuItem key={key} value={key}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        SelectProps={{
          multiple: true,
          renderValue: (selected: string[]) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {map(selected, (value) => (
                <Chip
                  sx={{ height: 22 }}
                  key={value}
                  label={value}
                  size="small"
                />
              ))}
            </Box>
          ),
        }}
        sx={{ minWidth: 180 }}
        label="Algorithm"
        variant="filled"
        value={selected}
        onChange={
          setFromEvent(setSelected) as (e: {
            target: { value: unknown };
          }) => void
        }
      >
        {algorithms.map((a) => (
          <MenuItem key={a} value={a}>
            {a}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
