import { Stack, Typography } from "@mui/material";
import { ComponentProps } from "react";
import { GridChartCard } from "./GridChartCard";

// const formatDate = (s?: string) =>
//   s ? format(parse(s, "yyyy-MM", new Date()), "MMM yyyy") : "";

// function useA(key: Trend) {
//   const { data } = useSeries(key, 36);
//   const peak = max(map(data, "count"));
//   const total = sum(map(data, "count"));
//   return { data, peak, total };
// }

export function RecentActivityChart(
  props: ComponentProps<typeof GridChartCard>
) {
  // const theme = useTheme();
  // const { data, peak, total } = useA("solution_algos");
  return (
    <GridChartCard
      primaryLabel="Activity"
      // secondaryLabel={`${total.toLocaleString()} solved in the past 3 years`}
      {...props}
      content={
        <Stack sx={{ gap: 1 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            The activity panel is coming soon.
          </Typography>
          {/* <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            {[head(data), last(data)].map((item, i) => (
              <Typography
                key={i}
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem", minWidth: "max-content" }}
              >
                {formatDate(item?._id)}
              </Typography>
            ))}
          </Stack>
          <Bar
            sx={{
              "> div": {
                gap: "0.5%",
                "> *": {
                  borderRadius: 0.5,
                  height: 12,
                },
              },
            }}
            label={null}
            renderLabel={(label) => label}
            values={map(data, ({ _id, count }) => ({
              value: 1 / data?.length,
              color: alpha(
                tone(theme.palette.mode, accentColors.teal),
                max([0.1, count / peak])
              ),
              label: `${formatDate(_id)}: ${count} solved`,
            }))}
          /> */}
        </Stack>
      }
    />
  );
}
