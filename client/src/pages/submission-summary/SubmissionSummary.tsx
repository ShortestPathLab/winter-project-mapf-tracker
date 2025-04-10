import { ExpandRounded } from "@mui-symbols-material/w400";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { AnimateInteger } from "components/AnimateInteger";
import { Grid } from "layout";
import { ReactNode } from "react";
import { paper } from "theme";
import { defaultDetails } from "./defaults";

export type Props = {
  extras?: ReactNode;
  status?: ReactNode;
  apiKey?: ReactNode;
  summaryStats?: {
    loading?: boolean;
    label: string;
    values: { name: string; count: number }[];
  }[];
  detailStats?: { name: string; stats: { name: string; count: number }[] }[];
  children?: ReactNode;
};

export default function SubmissionSummary({
  summaryStats = [],
  detailStats = defaultDetails,
  children,
}: Props) {
  return (
    <>
      <Grid
        width={230}
        sx={{
          gap: 2,
        }}
      >
        {summaryStats?.map?.(({ label, values, loading }) => (
          <Stack
            sx={{ position: "relative", p: 2, ...paper(0), overflow: "hidden" }}
            key={label}
          >
            {loading && (
              <CircularProgress
                size={32}
                sx={{
                  top: (t) => t.spacing(2),
                  position: "absolute",
                  right: (t) => t.spacing(2),
                }}
                variant="indeterminate"
              />
            )}
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ mt: -1, mb: 1 }}
            >
              {label}
            </Typography>
            <Grid width={100} sx={{ gap: 1 }}>
              {values.map(({ name, count }) => (
                <ListItemText
                  key={name}
                  primary={<AnimateInteger value={count} />}
                  secondary={name}
                />
              ))}
            </Grid>
          </Stack>
        ))}
      </Grid>
      {!!detailStats?.length && (
        <Stack
          sx={{
            my: 4,
            ...paper(),
            border: "none",
            boxShadow: "none",
            "> *:not(:last-child)": {
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
            },
          }}
        >
          {detailStats.map(({ name, stats }) => (
            <Accordion
              key={name}
              disableGutters
              sx={{
                backdropFilter: "none",
                boxShadow: "none",
              }}
            >
              <AccordionSummary expandIcon={<ExpandRounded />} sx={{ py: 2 }}>
                <Typography sx={{ fontWeight: 500 }}>{name}</Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  px: 0,
                  pb: 4,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-evenly",
                    alignItems: "flex-start",
                  }}
                >
                  {stats.map(({ name, count }) => (
                    <Stack sx={{ gap: 1 }} key={name}>
                      <Typography variant="h4" component="h2">
                        {count}
                      </Typography>
                      <Typography color="text.secondary">{name}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
      {children}
    </>
  );
}
