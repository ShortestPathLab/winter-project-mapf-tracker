import { DownloadRounded, ShowChartRounded } from "@mui-symbols-material/w400";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import { useSnackbarAction } from "components/Snackbar";
import { AnalysisButton } from "components/analysis/Analysis";
import { cellRendererBar, useDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { InstanceCollection } from "core/types";
import { useLocationState, useNavigate } from "hooks/useNavigation";
import { startCase } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";
import { analysisTemplate } from "pages/benchmarks-scenario-level/analysisTemplate";
import {
  useInstanceScenarioData,
  useMapData,
} from "queries/useBenchmarksQuery";
import { cloneElement } from "react";
import { downloadInstance, downloadMap, downloadScenario } from "./download";

export default function Table() {
  const state = useLocationState<MapLevelLocationState>();
  const { mapId } = state;
  const { data: mapData } = useMapData(mapId);
  const { data, isLoading } = useInstanceScenarioData(mapId);
  const navigate = useNavigate();
  const notify = useSnackbarAction();

  const actions = useDataGridActions<InstanceCollection>({
    items: [
      {
        name: "Trends",
        icon: <ShowChartRounded />,
        render: (row, trigger) => (
          <AnalysisButton
            button={(onClick) => cloneElement(trigger, { onClick })}
            template={analysisTemplate(row.id, mapId)}
          />
        ),
      },
    ],
    menuItems: [
      {
        name: "Download scenario",
        icon: <DownloadRounded />,
        action: notify(downloadScenario(mapData?.map_name), {
          end: "Scenario downloaded",
        }),
      },
      {
        name: "Download map",
        action: notify(downloadMap(mapData?.map_name), {
          end: "Map downloaded",
        }),
      },
      {
        name: "Download results (CSV)",
        action: notify(downloadInstance(mapData?.map_name), {
          end: "CSV downloaded",
        }),
      },
    ],
  });

  const columns: GridColDef<InstanceCollection>[] = [
    {
      field: "scen_type",
      headerName: "",
      sortable: true,
      width: 220,
      valueGetter: (_, row) => `${startCase(row.scen_type)} ${row.type_id}`,
      renderCell: ({ value, row }) => (
        <Item
          icon={<PreviewCard scenario={row.id} />}
          primary={startCase(value)}
          secondary={`${row.instances ?? "?"} instances`}
        />
      ),
    },
    {
      field: "solved_percentage",
      headerName: "Instances solved",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      fold: true,
      width: 200,
    },
    {
      field: "closed_percentage",
      headerName: "Instances closed",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      fold: true,
      width: 200,
    },
    actions,
  ];

  return (
    <DataGrid
      clickable
      search
      isLoading={isLoading}
      columns={columns}
      rows={data}
      onRowClick={({ row }) => {
        navigate<ScenarioLevelLocationState>("/instances", {
          ...state,
          scenId: row.id,
        });
      }}
    />
  );
}
