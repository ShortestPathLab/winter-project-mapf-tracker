import { Analysis } from "components/analysis/Analysis";
import { useLocationState } from "hooks/useNavigation";
import Layout from "layout/Layout";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { makePreviewImagePageRenderFunction } from "layout/render";
import { capitalize } from "lodash";
import { MapLevelLocationState } from "./MapLevelLocationState";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";
import { useSm } from "components/dialog/useSmallDisplay";

export default function Page() {
  const { mapName, mapId } = useLocationState<MapLevelLocationState>();
  const sm = useSm();
  return (
    <Layout
      slotProps={sm && { content: { sx: { bgcolor: "background.paper" } } }}
      title={capitalize(mapName)}
      description={`View all benchmarks and their results for ${mapName}`}
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
      ]}
      render={makePreviewImagePageRenderFunction(`/mapf-svg/${mapName}.svg`)}
    >
      <DataInspectorLayout
        analysisTabName={`Analyse ${mapName}`}
        data={<Table />}
        analysis={<Analysis template={analysisTemplate(mapName, mapId)} />}
      />
    </Layout>
  );
}
