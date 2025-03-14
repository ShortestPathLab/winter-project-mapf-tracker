import { Button } from "@mui/material";
import { Tip } from "components/Tip";
import { useNavigate } from "hooks/useNavigation";
import { Layout } from "layout";

export default function index() {
  const navigate = useNavigate();
  return (
    <Layout
      flat
      width={960}
      title="API keys"
      path={[
        { name: "More", url: "/more" },
        { name: "Manage", url: "/dashboard" },
      ]}
    >
      <Tip
        title="API keys (coming soon)"
        description="Create, revoke and manage API keys."
        actions={
          <>
            <Button sx={{ m: -1, mt: 0 }} onClick={() => navigate(-1)}>
              Go back
            </Button>
          </>
        }
      />
    </Layout>
  );
}
