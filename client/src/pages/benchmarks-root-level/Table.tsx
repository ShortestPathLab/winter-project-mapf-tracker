import {
  FileDownloadOutlined,
  InfoOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import { Box, Tooltip } from "@mui/material";
import { AnalysisButton } from "components/analysis/Analysis";
import {
  cellRendererBar,
  cellRendererText,
  useDataGridActions,
} from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { IconCard } from "components/IconCard";
import { useSnackbarAction } from "components/Snackbar";
import { Benchmark } from "core/types";
import { useDialog } from "hooks/useDialog";
import { useNavigate } from "hooks/useNavigation";
import { capitalize, startCase } from "lodash";
import { analysisTemplate } from "pages/benchmarks-map-level/analysisTemplate";
import { downloadMap } from "pages/benchmarks-map-level/download";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { cloneElement } from "react";
import BenchmarkDetails from "./BenchmarkDetails";
import { downloadBenchmarks, downloadBenchmarksResultsCSV } from "./download";
import { Item } from "components/Item";

function Details({ mapName }: { mapName: string }) {
  return (
    <Box sx={{ m: -2 }}>
      <BenchmarkDetails benchmark={mapName} />
    </Box>
  );
}

export default function Table() {
  const { data, isLoading } = useBenchmarksData();
  const navigate = useNavigate();
  const notify = useSnackbarAction();
  const { dialog, open } = useDialog(Details, {
    slotProps: { modal: { width: 720 } },
    padded: true,
    title: "Benchmark details",
  });

  const actions = useDataGridActions<Benchmark>({
    items: [
      {
        name: "Analyse this dataset",
        icon: <ShowChartOutlined />,
        render: (row, trigger) => (
          <AnalysisButton
            button={(onClick) => cloneElement(trigger, { onClick })}
            template={analysisTemplate(row.map_name, row.id)}
          />
        ),
      },
      {
        name: "Details",
        icon: <InfoOutlined />,
        action: (row) => open({ mapName: row.map_name }),
      },
    ],
    menuItems: [
      {
        name: "Download all scenarios (ZIP)",
        icon: <FileDownloadOutlined />,
        action: notify(downloadBenchmarks, { end: "File downloaded" }),
      },
      {
        name: "Download map",
        action: (r) =>
          notify(downloadMap(r.map_name), { end: "Map downloaded" })(),
      },
      {
        name: "Download results (CSV)",
        action: notify(downloadBenchmarksResultsCSV, {
          end: "CSV downloaded",
        }),
      },
    ],
  });

  const columns: GridColDef<Benchmark>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: () => <IconCard />,
      flex: 0,
    },
    {
      field: "map_name",
      headerName: "Map Name",
      sortable: true,
      minWidth: 220,
      flex: 1,
      renderCell: ({ value, row }) => (
        <Item
          primary={startCase(value)}
          secondary={`${row.scens ?? "?"} scenarios, ${
            row.instances ?? "?"
          } instances`}
        />
      ),
    },
    {
      field: "preview",
      headerName: "Preview",
      valueGetter: (_, r) => r.map_name,
      fold: true,
      renderCell: ({ value }) => (
        <Tooltip
          title={
            <Box
              component="img"
              sx={{ borderRadius: 1, height: 256 }}
              src={`/mapf-svg/${value}.svg`}
            />
          }
        >
          <Box
            component="img"
            sx={{ borderRadius: 1, height: 48 }}
            src={`/mapf-svg/${value}.svg`}
          />
        </Tooltip>
      ),
    },
    {
      field: "map_size",
      headerName: "Size",
      sortable: true,
      fold: true,
    },
    {
      field: "map_type",
      headerName: "Type",
      sortable: true,
      valueFormatter: capitalize,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "solved_percentage",
      headerName: "Instances Solved",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      fold: true,
      width: 300,
    },
    {
      field: "closed_percentage",
      headerName: "Instances Closed",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      fold: true,
      width: 300,
    },
    actions,
  ];

  return (
    <>
      <DataGrid
        search
        clickable
        isLoading={isLoading}
        columns={columns}
        rows={data}
        onRowClick={({ row }) => {
          navigate<MapLevelLocationState>("/scenarios", {
            mapId: row.id,
            mapName: row.map_name,
          });
        }}
      />
      {dialog}
    </>
  );
}
