import {
  CloseRounded,
  DeleteRounded,
  CheckRounded,
  DoNotDisturbOnRounded,
  HourglassEmptyRounded,
  PlayArrowRounded,
  StopRounded,
} from "@mui-symbols-material/w400";
import {
  alpha,
  Box,
  Button,
  capitalize,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Bar, formatValue, useDataGridActions } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { Dialog } from "components/dialog";
import { ConfirmDialog } from "components/dialog/Modal";
import { Item } from "components/Item";
import Enter from "components/transitions/Enter";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { Instance, SummarySlice } from "core/types";
import { useDialog } from "hooks/useDialog";
import { identity, isNumber, join, map, sumBy, times } from "lodash";
import pluralize from "pluralize";
import {
  deleteAll,
  OngoingSubmission,
  useDeleteOngoingSubmissionMutation,
  useOngoingSubmissionSummaryQuery,
} from "queries/useOngoingSubmissionQuery";
import { useState } from "react";
import { Arrow } from "./Arrow";
import { DetailsDialog } from "./DetailsDialog";
import { MapLabel } from "./MapLabel";
import { disambiguate, Model, Models } from "./Model";
import { ScenarioLabel } from "./ScenarioLabel";
import { SubmissionInstanceContext } from "./SubmissionInstanceContext";
import { SubmissionInstanceLabel } from "./SubmissionInstanceLabel";
import { useDeleteOngoingSubmissionByScenarioIndexMutation } from "./useDeleteOngoingSubmissionByScenarioIndexMutation";

function getSubmissionInfoText(
  submission: OngoingSubmission,
  instance: Instance
) {
  if (
    submission?.validation?.isValidationRun &&
    submission?.validation?.outcome !== "outdated"
  ) {
    const errors = submission?.validation?.errors;
    const showErrors = errors?.length;
    const showImprovement = submission?.validation?.outcome === "valid";

    const improvement = (() => {
      if (isNumber(instance?.solution_cost)) {
        const isImprovement = instance.solution_cost > submission.cost;
        const isTie = instance.solution_cost === submission.cost;
        return [
          isTie ? "Tie" : isImprovement ? "New record" : "Dominated",
          `(yours: ${submission.cost}, best: ${instance.solution_cost})`,
        ].join(" ");
      }

      return `New record (${submission.cost}, no previous claims)`;
    })();

    return capitalize(
      [
        showErrors && join(map(errors, "label"), ", "),
        showImprovement && improvement,
      ]
        .filter(identity)
        .join("\n")
    );
  }

  return "";
}

function arrayFallback<T, U>(s: T[] | undefined, u: U) {
  return s?.length ? s : u;
}

function placeholder(id: string) {
  return [{ id: `${id}-placeholder` }];
}

function renderPlaceholder() {
  return (
    <Enter in axis="x">
      <Stack direction="row">
        <Box sx={{ width: 64 }} />
        <Item secondary="No items" />
      </Stack>
    </Enter>
  );
}

export default function Table({ apiKey }: { apiKey?: string | number }) {
  const theme = useTheme();
  const { dialog, open } = useDialog(DetailsDialog, {
    title: "Submission details",
    padded: true,
  });
  const { data, isLoading } = useOngoingSubmissionSummaryQuery(apiKey);
  const { mutateAsync: deleteByScenarioIndex } =
    useDeleteOngoingSubmissionByScenarioIndexMutation(apiKey);
  const { mutate: deleteSubmissions } =
    useDeleteOngoingSubmissionMutation(apiKey);

  const [expanded, setExpanded] = useBooleanMap();
  const [slice, setSlice] = useState<keyof SummarySlice>("total");

  const actions = useDataGridActions<Model>({
    menuItems: [
      {
        hidden: (row) =>
          disambiguate(row, {
            map: () => true,
            scenario: () => false,
            instance: () => false,
            fallback: () => true,
          }),
        name: "Delete",
        icon: <DeleteRounded />,
        action: (row) =>
          disambiguate(row, {
            scenario: (row) =>
              deleteByScenarioIndex({ scenario: row.id, index: deleteAll }),
            instance: (row) =>
              deleteByScenarioIndex({
                scenario: row.scenario,
                index: row.index,
              }),
          }),
      },
    ],
  });

  const total = (row: Models["map"] | Models["scenario"]) =>
    row.count.total - row.count.outdated;

  const summaryIcon = (row: Models["map"] | Models["scenario"]) =>
    row.count.invalid ? (
      <Tooltip
        title={`${pluralize("instance", row.count.invalid, true)} of ${total(
          row
        )} invalid`}
      >
        <CloseRounded color="error" fontSize="small" />
      </Tooltip>
    ) : (
      <Tooltip title="All instances valid">
        <CheckRounded color="success" fontSize="small" />
      </Tooltip>
    );

  const hasRun = (row: Models["map"] | Models["scenario"]) =>
    row.count.valid + row.count.invalid + row.count.outdated;

  const progressLabel = (row: Models["map"] | Models["scenario"]) =>
    formatValue(hasRun(row) / row.count.total);

  const bar = (row: Models["map"] | Models["scenario"]) => (
    <Bar
      buffer
      label={
        hasRun(row) === row.count.total ? summaryIcon(row) : progressLabel(row)
      }
      values={[
        {
          color: "success.main",
          value: row.count.valid / total(row),
          label: "Valid",
        },
        {
          color: "error.main",
          value: row.count.invalid / total(row),
          label: "Invalid",
        },
        {
          color: alpha(theme.palette.primary.main, 0.4),
          value: row.count.queued / total(row),
          label: "Running",
        },
      ]}
    />
  );

  const columns: GridColDef<Model>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: (row) => <Arrow open={expanded[row.id]} />,
          scenario: (row) => <Arrow open={expanded[row.id]} />,
        }),
      flex: 0,
    },
    {
      field: "name",
      headerName: "Submission",
      minWidth: 220,
      flex: 1,
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: (row) => (
            <MapLabel mapId={row.id} count={row.count[slice] ?? 0} />
          ),
          scenario: (row) => (
            <ScenarioLabel scenarioId={row.id} count={row.count[slice] ?? 0} />
          ),
          instance: ({ scenario, index }) => (
            <SubmissionInstanceLabel
              apiKey={apiKey}
              scenarioId={scenario}
              index={index}
              slice={slice}
            />
          ),
          fallback: renderPlaceholder,
        }),
    },
    {
      field: "count.total",
      headerName: "Results",
      type: "number",
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: bar,
          scenario: bar,
          instance: (row) => (
            <SubmissionInstanceContext
              apiKey={apiKey}
              scenarioId={row.scenario}
              index={row.index}
              slice={slice}
              render={({ submission, isLoading }) =>
                !isLoading && (
                  <Bar
                    label={
                      {
                        valid: (
                          <CheckRounded color="success" fontSize="small" />
                        ),
                        invalid: (
                          <CloseRounded color="error" fontSize="small" />
                        ),
                        outdated: (
                          <DoNotDisturbOnRounded
                            color="disabled"
                            fontSize="small"
                          />
                        ),
                        queued: (
                          <Stack sx={{ alignItems: "center" }}>
                            <CircularProgress size={24} />
                          </Stack>
                        ),
                      }[submission?.validation?.outcome] ?? (
                        <HourglassEmptyRounded
                          color="disabled"
                          fontSize="small"
                        />
                      )
                    }
                    buffer
                    values={[
                      {
                        valid: {
                          color: "success.main",
                          value: 1,
                          label: "Valid",
                        },
                        invalid: {
                          color: "error.main",
                          value: 1,
                          label: "Invalid",
                        },
                        queued: {
                          color: alpha(theme.palette.primary.main, 0.4),
                          value: 1,
                          label: "Running",
                        },
                        outdated: {
                          color: "action.disabled",
                          value: 1,
                          label: "Unused - duplicate",
                        },
                      }[submission?.validation?.outcome] ?? {
                        color: "success.main",
                        value: 0,
                        label: "Pending",
                      },
                    ]}
                  />
                )
              }
            />
          ),
        }),
      fold: true,
      width: 300,
    },
    {
      field: "info",
      headerName: "Details",
      type: "number",
      renderCell: ({ row }) =>
        disambiguate(row, {
          instance: (row) => (
            <SubmissionInstanceContext
              apiKey={apiKey}
              scenarioId={row.scenario}
              index={row.index}
              slice={slice}
              render={({ isLoading, submission, instance }) =>
                isLoading ? (
                  ""
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      width: " 100%",
                      textOverflow: "ellipsis",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {getSubmissionInfoText(submission, instance)}
                  </Typography>
                )
              }
            />
          ),
        }),
      fold: true,
      width: 380,
    },
    actions,
  ];

  return (
    <>
      <Stack
        sx={{ p: 2, gap: 1, alignItems: "center", flexWrap: "wrap" }}
        direction="row"
      >
        {[
          { label: "Valid", key: "valid" },
          { label: "Invalid", key: "invalid" },
          { label: "Duplicate", key: "outdated" },
          { label: "All", key: "total" },
        ].map(({ label, key }) => {
          const selected = key === slice;
          return (
            <Chip
              key={key}
              sx={{
                pl: 0.25,
                border: selected
                  ? (t) => `1px ${alpha(t.palette.primary.main, 0.2)}`
                  : (t) => `1px solid ${t.palette.divider}`,
                bgcolor: selected
                  ? (t) => alpha(t.palette.primary.main, 0.2)
                  : undefined,
              }}
              icon={
                <Collapse in={selected} orientation="horizontal">
                  <CheckRounded
                    fontSize="small"
                    color={selected ? "primary" : undefined}
                  />
                </Collapse>
              }
              label={label}
              variant="outlined"
              onClick={() => setSlice(key as keyof SummarySlice)}
            />
          );
        })}
        <Box sx={{ flex: 1 }} />
        <Button
          color="inherit"
          disabled
          startIcon={<PlayArrowRounded />}
          onClick={() => deleteSubmissions(deleteAll)}
        >
          Run validation
        </Button>
        <Button
          color="inherit"
          disabled
          startIcon={<StopRounded />}
          onClick={() => deleteSubmissions(deleteAll)}
        >
          Pause validation
        </Button>
        <Divider orientation="vertical" flexItem />
        <Dialog
          title="Delete all submissions"
          slotProps={{ modal: { variant: "default" } }}
          padded
          trigger={(onClick) => (
            <Button
              disabled={!sumBy(data?.maps, "count.total")}
              color="error"
              startIcon={<DeleteRounded />}
              onClick={onClick}
            >
              Delete all
            </Button>
          )}
        >
          {({ close }) => (
            <ConfirmDialog
              hintText="Are you sure you want to delete all submissions? This action cannot be undone."
              acceptLabel="Delete all"
              closeLabel="Cancel"
              onClose={close}
              onAccept={() => {
                deleteSubmissions(deleteAll);
                close();
              }}
            />
          )}
        </Dialog>
      </Stack>
      <TreeDataGrid
        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
        getChildren={(row) =>
          disambiguate(row, {
            map: (row) => arrayFallback(row.scenarios, placeholder(row.id)),
            scenario: (row) =>
              arrayFallback(
                times(row.count[slice], (i) => ({
                  id: `${row.id}-${i}`,
                  scenario: row.id,
                  index: i,
                })),
                placeholder(row.id)
              ),
            instance: () => undefined,
          })
        }
        clickable
        onRowClick={({ row }) =>
          disambiguate(row, {
            instance: (row) =>
              open({
                apiKey,
                index: row.index,
                scenarioId: row.scenario,
                slice,
              }),
          })
        }
        expanded={expanded}
        onExpandedChange={setExpanded}
        isLoading={isLoading}
        columns={columns}
        rows={data?.maps}
      />
      {dialog}
    </>
  );
}
