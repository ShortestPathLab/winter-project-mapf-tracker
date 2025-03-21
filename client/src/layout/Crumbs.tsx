import {
  ArrowBackRounded,
  ArrowForwardRounded,
  ArrowUpwardRounded,
  ChevronRightRounded,
  DockToRightFilledRounded,
  DockToRightRounded,
} from "@mui-symbols-material/w400";
import {
  Box,
  Breadcrumbs,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useMd } from "components/dialog/useSmallDisplay";
import { useHistory, useNavigate } from "hooks/useNavigation";
import { last } from "lodash";
import { QuickNavigation } from "pages/home/QuickNavigation";
import { useOptions } from "utils/OptionsProvider";
import { PageHeaderProps } from "./PageHeader";

export const Crumbs = ({ path, current }: PageHeaderProps) => {
  const { canForward, canGoBack } = useHistory();
  const navigate = useNavigate();
  const [{ hideSidebar, sidebarOpenMobile }, setOptions] = useOptions();
  const md = useMd();
  const isSidebarOpen = md ? sidebarOpenMobile : !hideSidebar;
  return (
    <>
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        <Box sx={{ px: 3, pr: 0 }}>
          <IconButton
            edge="start"
            onClick={() => {
              setOptions(
                md
                  ? {
                      sidebarOpenMobile: !sidebarOpenMobile,
                    }
                  : {
                      hideSidebar: !hideSidebar,
                    }
              );
            }}
          >
            {isSidebarOpen ? (
              <DockToRightFilledRounded fontSize="small" />
            ) : (
              <DockToRightRounded fontSize="small" />
            )}
          </IconButton>
        </Box>
        <Divider
          flexItem
          orientation="vertical"
          sx={{ height: 24, my: "auto", ml: -1 }}
        />
        <Scroll x fadeX>
          <Breadcrumbs
            separator={<ChevronRightRounded fontSize="small" />}
            sx={{ minWidth: "max-content", p: 3, pl: 0, py: 2, flex: 1 }}
          >
            {path.map(({ name, url, state }) => (
              <Link
                key={name}
                sx={{ cursor: "pointer" }}
                underline="hover"
                color="inherit"
                onClick={() => navigate(url, state)}
              >
                <Typography variant="body1" sx={{ lineHeight: 0 }}>
                  {name}
                </Typography>
              </Link>
            ))}
            <Typography
              color="text.primary"
              variant="body1"
              sx={{ lineHeight: 0 }}
            >
              {current}
            </Typography>
          </Breadcrumbs>
        </Scroll>
        <Stack
          direction="row"
          sx={{
            p: 1,
            py: 2,
            gap: 1,
          }}
        >
          <IconButton
            disabled={!canGoBack}
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowBackRounded fontSize="small" />
          </IconButton>
          <IconButton
            disabled={!canForward}
            onClick={() => {
              navigate(1);
            }}
          >
            <ArrowForwardRounded fontSize="small" />
          </IconButton>
          <IconButton
            disabled={!path.length}
            onClick={() => {
              const { url, state } = last(path);
              navigate(url, state);
            }}
          >
            <ArrowUpwardRounded fontSize="small" />
          </IconButton>
        </Stack>
        <Divider
          flexItem
          orientation="vertical"
          sx={{ height: 24, my: "auto", ml: -1 }}
        />
        <Box sx={{ minWidth: 180, pr: 3, pl: 1 }}>
          <QuickNavigation />
        </Box>
      </Stack>
      <Divider />
    </>
  );
};
