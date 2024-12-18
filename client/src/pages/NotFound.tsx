import { NotFound } from "components/NotFound";
import { Layout } from "layout";

export function NotFoundPage() {
  return (
    <Layout width={720} title="Oops" path={[{ name: "Home", url: "/" }]}>
      <NotFound />
    </Layout>
  );
}
