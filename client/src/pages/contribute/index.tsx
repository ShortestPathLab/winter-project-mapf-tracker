import { Stack } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { Layout } from "layout";
import { Info } from "./Info";
import { SubmitRequestForm } from "./SubmitRequestForm";
import TrackSubmissionHero from "./TrackSubmissionHero";

export default function Page() {
  const sm = useSm();
  return (
    <Layout
      flat
      title="Submit an algorithm"
      path={[{ name: "Submit", url: "/submit" }]}
    >
      <Stack
        sx={{
          flexDirection: { md: "column", lg: "row" },
          alignItems: { md: "stretch", lg: "flex-start" },
          gap: sm ? 2 : 3,
        }}
      >
        <Info />
        <Stack sx={{ gap: sm ? 2 : 3, flex: 1 }}>
          <TrackSubmissionHero />
          <SubmitRequestForm />
        </Stack>
      </Stack>
    </Layout>
  );
}
