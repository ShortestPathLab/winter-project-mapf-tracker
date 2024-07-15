import React, { useMemo, useReducer } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import MapTable from "./MapTable";
import Navbar from "./Navbar";

import AboutUs from "./AboutUsPage";
import Contribute from "./ContributePage";
import Dashboard from "./Dashboard";
import Download from "./DownloadPage";
import Visualizer from "./MAPFVis";
import Paper from "./PaperPage";
import ScenarioTable from "./ScenarioTable";
import SolutionPage from "./SolutionPage";
import Submissions from "./Submissions";
import Summary from "./Summary";
import SystemDemo from "./SystemDemo";
import TrackSubmission from "./TrackSubmission";
import UserMapPage from "./UserMapPage";

import { Box, Stack, colors } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { Navigate } from "react-router-dom";
import SubmissionSummaryPage from "./SubmissionSummaryPage";
import { ThemeContext } from "./ThemeProvider";

const theme = (t: "light" | "dark") =>
  createTheme({
    palette: {
      mode: t,
      background:
        t === "light"
          ? { default: "#eaeaea", paper: "#fff" }
          : { default: "#111317", paper: "#17191d" },
    },
    shape: { borderRadius: 8 },
    shadows: [
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],
    typography: {
      allVariants: {
        fontFamily: '"Inter", "Roboto Slab", "Helvetica", "Arial", sans-serif',
        letterSpacing: -0.15,
      },
      h1: { fontWeight: 500, fontSize: 42 },
      h2: { fontWeight: 500, fontSize: 36, letterSpacing: -1 },
      h3: { fontWeight: 500, fontSize: 24 },
      h4: { fontWeight: 500, letterSpacing: -0.4, fontSize: 24 },
      h5: { fontWeight: 500, letterSpacing: -0.4, fontSize: 20 },
      h6: { fontWeight: 500, letterSpacing: -0.4, fontSize: 18 },
      button: { textTransform: "none" },
    },
    components: {
      MuiButton: {
        styleOverrides: { contained: { padding: "16px 32px" } },
      },
    },
  });

export default function App() {
  const themeState = useReducer((prev) => {
    const next = prev === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    return next;
  }, (localStorage.getItem("theme") || "dark") as any);
  const [mode] = themeState;
  const t = useMemo(() => theme(mode), [mode]);
  console.log(t);
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ThemeContext.Provider value={themeState}>
      <ThemeProvider theme={t}>
        <ConfirmProvider>
          <Stack
            sx={{
              bgcolor: "background.default",
              minHeight: "100svh",
              color: "text.primary",
            }}
          >
            <Navbar />

            <Box sx={{ px: 2 }}>
              <Routes>
                <Route path="/" element={<MapTable />} />
                <Route
                  path="/benchmarks"
                  element={<MapTable showHeader={false} />}
                />
                <Route path="/scenarios" element={<ScenarioTable />} />
                <Route path="/instances" element={<SolutionPage />} />
                <Route path="/visualization" element={<Visualizer />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="/aboutUs" element={<AboutUs />} />
                <Route path="/systemDemo" element={<SystemDemo />} />
                <Route path="/submissions" element={<Submissions />} />
                <Route
                  path="/submissionSummary"
                  element={<SubmissionSummaryPage />}
                />
                <Route path="/contributes" element={<Contribute />} />
                <Route path="/download" element={<Download />} />
                <Route path="/papers" element={<Paper />} />
                <Route path="/trackSubmission" element={<TrackSubmission />} />
                <Route
                  path="/dashboard"
                  element={
                    localStorage.getItem("user") !== null ? (
                      <Dashboard />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
                <Route
                  path="/user/maps"
                  element={
                    localStorage.getItem("user") !== null ? (
                      <UserMapPage />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
              </Routes>
            </Box>
          </Stack>
        </ConfirmProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}