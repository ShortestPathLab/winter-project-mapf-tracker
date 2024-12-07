import { Prose } from "layout";
import { ArticleLayout } from "layout/ArticleLayout";
import { paper } from "theme";
import Content from "./content.mdx";

export default function Page() {
  return (
    <ArticleLayout
      title="Submitting data to MAPF Tracker"
      subtitle="Quick-start guide on how to submit your results to the platform"
      path={[
        { name: "Home", url: "/" },
        { name: "Docs", url: "/docs" },
      ]}
    >
      <Prose
        sx={{
          "& h3:not(:first-child)": { mt: 6 },
          " hr": { mt: 6 },
          " table": { ...paper(0.5), p: 2, width: "100%" },
        }}
      >
        <Content />
      </Prose>
    </ArticleLayout>
  );
}
