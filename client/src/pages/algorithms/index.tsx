import { FolderZipRounded } from "@mui-symbols-material/w400";
import { Button, Stack, Typography, alpha, useTheme } from "@mui/material";
import { Item } from "components/Item";
import { Tip } from "components/Tip";
import { Analysis } from "components/analysis/Analysis";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { Bar, DataGrid, cellRendererChip } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { useSurface } from "components/surface";
import { AlgorithmDetails } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { DataInspectorLayout, Prose } from "layout";
import { GalleryLayout } from "layout/GalleryLayout";
import { capitalize, flatMap, map, max, maxBy, startCase, sum } from "lodash";
import { AlgorithmDownloadOptions } from "pages/benchmarks-map-level/AlgorithmDownloadOptions";
import { compareTemplate } from "pages/benchmarks-root-level/analysisTemplate";
import { useAlgorithmDetailsData } from "queries/useAlgorithmQuery";
import { AlgorithmPreview } from "./AlgorithmPreview";
import Description from "./description.md";
import { inferOptimality } from "./inferOptimality";

const g = [
  "instances_solved",
  "instances_closed",
  "best_lower",
  "best_solution",
];

function Table() {
  const { data: algorithms } = useAlgorithmDetailsData();
  const theme = useTheme();
  const total = max(flatMap(g, (c) => map(algorithms, c) || 1)) * 1.5;
  const navigate = useNavigate();
  const columns: GridColDef<AlgorithmDetails>[] = [
    {
      field: "algo_name",
      headerName: "Submission",
      sortable: true,
      maxWidth: 360,
      flex: 1,
      renderCell: ({ value, row }) => (
        <Item
          icon={<AlgorithmPreview id={row.id} />}
          primary={startCase(value)}
          secondary={row.authors}
        />
      ),
    },
    {
      field: "optimality",
      headerName: "Optimality",
      sortable: true,
      maxWidth: 120,
      flex: 1,
      fold: true,
      valueGetter: (_, row) =>
        inferOptimality(row) ? "optimal" : "suboptimal",
      renderCell: ({ formattedValue }) =>
        cellRendererChip({ formattedValue: startCase(formattedValue) }),
    },
    ...[
      {
        color: theme.palette.success.main,
        best: "instances_closed",
        bestLabel: "closed",
        total: "instances_solved",
        totalLabel: "solved",
      },
    ].map(({ best: closed, total: solved, color, bestLabel, totalLabel }) => ({
      field: solved,
      flex: 2,
      maxWidth: 480,
      headerName: `Instances ${bestLabel}/${totalLabel}`,
      sortable: true,
      type: "number" as const,
      renderCell: ({ row }) => (
        <Stack sx={{ gap: 1, width: "100%" }}>
          <Typography variant="body2" color="text.secondary">
            {`${formatLargeNumber(
              row[closed]
            )} ${bestLabel} / ${formatLargeNumber(row[solved])} ${totalLabel}`}
          </Typography>
          <Bar
            values={[
              {
                value: row[closed] / total,
                label: capitalize(bestLabel),
                color: color,
              },
              {
                value: (row[solved] - row[closed]) / total,
                label: capitalize(totalLabel),
                color: alpha(color, 0.35),
              },
            ]}
          />
        </Stack>
      ),
      fold: true,
    })),
    ...[
      {
        key: "best_solution",
        label: "best solution",
      },
      {
        label: "best lower-bound",
        key: "best_lower",
      },
    ].map(({ key, label }) => ({
      field: key,
      flex: 2,
      maxWidth: 240,
      headerName: `Instances ${label}`,
      sortable: true,
      type: "number" as const,
      renderCell: ({ row }) => (
        <Stack sx={{ gap: 1, width: "100%" }}>
          <Typography variant="body2" color="text.secondary">
            {`${formatLargeNumber(row[key])} ${label}`}
          </Typography>
          <Bar
            values={[
              {
                value: row[key] / total,
                label: capitalize(label),
                color: "info.main",
              },
            ]}
          />
        </Stack>
      ),
      fold: true,
    })),
  ];
  return (
    <DataGrid
      clickable
      onRowClick={(row) => navigate(`/submissions/${row.id}`)}
      search
      columns={columns}
      rows={algorithms ?? []}
    />
  );
}

export default function AlgorithmsPage() {
  const { open: openDialog, dialog } = useSurface(AlgorithmDownloadOptions, {
    title: "Export instances",
    variant: "fullscreen",
  });
  const { data: algorithms } = useAlgorithmDetailsData();
  return (
    <GalleryLayout
      root
      title="Submissions"
      items={[
        { value: algorithms?.length, label: "Submission count" },
        {
          label: "Total instances submitted",
          value: algorithms
            ? sum(map(algorithms, "instances_solved"))
            : undefined,
        },
        {
          label: "Most instances solved",
          value: algorithms
            ? maxBy(algorithms, "instances_solved")?.algo_name
            : undefined,
        },
        {
          label: "Most instances closed",
          value: algorithms
            ? maxBy(algorithms, "instances_closed")?.algo_name
            : undefined,
        },
      ]}
      path={[{ name: "Home", url: "/" }]}
      actions={{
        options: [
          {
            icon: <FolderZipRounded />,
            label: "Bulk export instances",
            action: () => openDialog(),
            primary: true,
          },
        ],
      }}
    >
      <Tip
        title={<>Browse submissions</>}
        description={
          <Prose sx={{ fontSize: (t) => t.typography.body2.fontSize, my: -2 }}>
            <Description />
          </Prose>
        }
        actions={
          <>
            <Button onClick={() => open("/docs/about", "_blank")}>
              See the docs
            </Button>
            <Button onClick={() => open("/docs/about", "_blank")}>
              Make a submission instead
            </Button>
          </>
        }
      />
      <DataInspectorLayout
        dataTabName="Browse submissions"
        data={<Table />}
        analysis={<Analysis template={compareTemplate} />}
      />
      {dialog}
    </GalleryLayout>
  );
}
