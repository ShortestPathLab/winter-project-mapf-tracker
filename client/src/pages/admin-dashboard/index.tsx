import { TabContext } from "@mui/lab";
import { Box, Stack } from "@mui/material";
import { Router } from "components/Router";
import { head } from "lodash";
import { NotFoundPage } from "pages/NotFound";
import { useCredentials } from "queries/useLogInQuery";
import { matchPath, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { pages } from "./pages";
import Enter from "components/dialog/Enter";
import { BlankPage } from "pages/Blank";

export default function index() {
  const { data: credentials } = useCredentials();
  const { pathname } = useLocation();
  const match = matchPath("/dashboard/:section?/", pathname);
  const { section } = match?.params ?? {};
  return credentials ? (
    <TabContext value={section ?? head(pages()).value}>
      <Stack
        direction="row"
        sx={{
          height: "100%",
        }}
      >
        <Enter axis="X" in distance={-8}>
          <Box sx={{ height: "100%" }}>
            <Sidebar sx={{ height: "100%" }} />
          </Box>
        </Enter>
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            height: "100%",
          }}
        >
          <Router
            routes={pages().map(({ content, value }) => ({
              content,
              path: `/dashboard/${value}`,
              parent: value === "" ? "/" : "/dashboard/",
            }))}
          />
        </Box>
      </Stack>
    </TabContext>
  ) : (
    <BlankPage />
  );
}
