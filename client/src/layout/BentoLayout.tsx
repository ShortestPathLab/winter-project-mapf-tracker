import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Divider, Stack, Tab, Typography } from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode, useState } from "react";
import Layout, { LayoutProps } from "./Layout";
import { topbarHeight } from "./topbarHeight";
import { TabBar } from "./TabBar";

export function BentoLayout({
  contentLeft,
  contentRight,
  labelLeft,
  labelRight,
  widthLeft = 460,
  ...props
}: LayoutProps & {
  labelLeft?: string;
  labelRight?: string;
  contentLeft?: ReactNode;
  widthLeft?: number;
  contentRight?: ReactNode;
}) {
  const sm = useSm();
  const [tab, setTab] = useState<"left" | "right">("left");

  return (
    <Layout flat {...props}>
      {sm ? (
        <TabContext value={tab}>
          <TabBar>
            <TabList onChange={(e, v) => setTab(v)}>
              <Tab label={labelLeft} value="left" />
              <Tab label={labelRight} value="right" />
            </TabList>
          </TabBar>
          <TabPanel
            value="left"
            sx={{ display: "flex", gap: 4, flexDirection: "column", p: 0 }}
          >
            {contentLeft}
          </TabPanel>
          <TabPanel
            value="right"
            sx={{
              display: "flex",
              gap: 4,
              flexDirection: "column",
              p: 0,
              mt: -6,
            }}
          >
            {contentRight}
          </TabPanel>
        </TabContext>
      ) : (
        <Stack
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            height: `calc(100dvh - ${topbarHeight(sm)}px)`,
            right: 0,
          }}
        >
          <Stack
            direction="row"
            sx={{
              bgcolor: "background.paper",
              height: "100%",
            }}
          >
            <Scroll y style={{ flex: 0.3, minWidth: widthLeft }}>
              <Stack sx={{ gap: 4, p: 3, flex: 1 }}>
                <Typography variant="h2">{labelLeft}</Typography>
                {contentLeft}
              </Stack>
            </Scroll>
            <Divider flexItem orientation="vertical" />
            <Scroll y style={{ flex: 1 }}>
              <Stack sx={{ gap: 4, p: 3, flex: 1 }}>
                <Typography variant="h2">{labelRight}</Typography>
                {contentRight}
              </Stack>
            </Scroll>
          </Stack>
        </Stack>
      )}
    </Layout>
  );
}
