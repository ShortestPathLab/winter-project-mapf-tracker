import {
  BlurOffOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  CloseOutlined,
  FirstPageOutlined,
  PauseOutlined,
  PlayArrowOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Container, Graphics, Stage } from "@pixi/react";
import { Dot } from "components/Dot";
import { Item } from "components/Item";
import { Bar } from "components/data-grid";
import { useSm } from "components/dialog/useSmallDisplay";
import Enter from "components/transitions/Enter";
import { useLocationState } from "hooks/useNavigation";
import { find, findIndex, floor, isUndefined, mapValues, zip } from "lodash";
import { Viewport as PixiViewport } from "pixi-viewport";
import { FederatedPointerEvent } from "pixi.js";
import {
  Reducer,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import AutoSize from "react-virtualized-auto-sizer";
import { paper } from "theme";
import { colors } from "utils/colors";
import { lerp, lerpCircle, useLerp } from "utils/useLerp";
import Viewport from "./Viewport";
import { VisualiserLocationState } from "./VisualiserLocationState";
import { usePlayback } from "./usePlayback";
import { useSolution } from "./useSolution";
import { WHITE, BLACK, SCALE_SHOW_GRID_THRESHOLD } from "./constants";
import {
  $grid,
  $box,
  $agentDiagnostics,
  $map,
  $agents,
  $bg,
  getAngle,
  Arrow,
} from "./draw";

export default function () {
  const state = useLocationState<VisualiserLocationState>();
  return (
    <Visualisation
      instanceId={state.instanceId}
      solutionId={state.solutionId}
      source={state.source}
    />
  );
}

export function Visualisation({
  instanceId,
  solutionId,
  source,
}: {
  instanceId?: string;
  solutionId?: string;
  source?: "ongoing" | "submitted";
}) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const sm = useSm();
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────────────

  const { map, result, getAgentPositions, getAgentPath, isLoading } =
    useSolution({
      instanceId,
      solutionId,
      source,
    });

  const { timespan = 0, x = 0, y = 0, goals } = result ?? {};

  const { step, backwards, forwards, play, pause, paused, restart, seek } =
    usePlayback(timespan);

  const time = useLerp(step);

  type Selection = {
    agent?: number;
    show?: boolean;
  };
  const [selection, setSelection] = useReducer<Reducer<Selection, Selection>>(
    (a, b) => ({ ...a, ...b }),
    {}
  );

  // ─────────────────────────────────────────────────────────────────────

  const getAgentColor = useMemo(() => {
    return (i: number) => colors[i % colors.length]?.[dark ? "300" : "A400"];
  }, [dark]);

  const drawGrid = useMemo(
    () => $grid({ x, y }, dark ? WHITE : BLACK),
    [x, y, dark]
  );

  const drawBox = useMemo(
    () => $box({ x, y }, dark ? WHITE : BLACK),
    [x, y, dark]
  );

  const drawAgent = useMemo(
    () =>
      !isUndefined(selection.agent) &&
      $agentDiagnostics(
        getAgentColor(selection.agent),
        getAgentPath?.(selection.agent),
        goals?.[selection.agent]
      ),
    [step, getAgentColor, selection, getAgentPath, goals]
  );

  const drawMap = useMemo(() => $map(map, dark ? WHITE : BLACK), [map, dark]);

  const [t0, t1, t2] = [floor(time), floor(time) + 1, floor(time) + 2];
  const dt = time - t0;

  const drawAgents = useMemo(() => {
    const positions = zip(getAgentPositions(t0), getAgentPositions(t1));
    return $agents(
      positions.map(([a, b], i) => ({
        x: lerp(a.x, b.x, dt),
        y: lerp(a.y, b.y, dt),
        color: getAgentColor(i),
      }))
    );
  }, [t0, t1, dt, getAgentPositions, getAgentColor, dark]);

  // ──────────────────────────────────────────────────────────────────────

  const [viewport, setViewport] = useState<PixiViewport>();
  const [showGrid, setShowGrid] = useState(false);
  const container = useRef<HTMLDivElement>();

  const updateShowGrid = useCallback(() => {
    if (viewport && x) {
      setShowGrid(viewport.scale.x > SCALE_SHOW_GRID_THRESHOLD);
    }
  }, [viewport, x, setShowGrid]);

  useEffect(() => {
    if (viewport) {
      viewport.on("moved", updateShowGrid);
      updateShowGrid();
      return () => void viewport.off("moved", updateShowGrid);
    }
  }, [viewport, updateShowGrid]);

  useEffect(() => {
    if (viewport && x && y) {
      viewport.fit(false, x, y);
      viewport.moveCenter(x / 2, y / 2);
      viewport.zoom(10, true);
      updateShowGrid();
    }
  }, [viewport, x, y, updateShowGrid]);

  useEffect(() => {
    if (viewport && container.current) {
      const f = (e: FederatedPointerEvent) => {
        const position = mapValues(viewport.toWorld(e.screen), (x) => floor(x));
        const agent = find(
          getAgentPositions(step),
          (a) => a.x === position.x && a.y === position.y
        );
        container.current.style.cursor = agent ? "pointer" : "default";
      };
      viewport.on("mousemove", f);
      return () => void viewport.off("mousemove", f);
    }
  }, [viewport, step, getAgentPositions, container.current]);

  useEffect(() => {
    if (viewport) {
      const f = (e: { world: { x: number; y: number } }) => {
        const position = mapValues(e.world, (x) => floor(x));
        const agent = findIndex(
          getAgentPositions(step),
          (a) => a.x === position.x && a.y === position.y
        );
        if (agent === -1) return;
        setSelection({ agent, show: true });
      };
      viewport.on("clicked", f);
      return () => void viewport.off("clicked", f);
    }
  }, [viewport, getAgentPositions, step, setSelection]);

  const noVisualisation = !isLoading && !result;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "absolute",
      }}
    >
      {noVisualisation ? (
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            gap: 2,
          }}
        >
          <BlurOffOutlined />
          <Typography>No solution available</Typography>
          <Button
            variant="contained"
            sx={{ py: 1, px: 2, mt: 2 }}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </Stack>
      ) : (
        <AutoSize>
          {(size) => (
            <>
              {isLoading ? (
                <Stack
                  sx={{
                    ...size,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Stack>
              ) : (
                <Fade
                  in
                  style={{
                    transitionDelay: "300ms",
                  }}
                  key={`${size.width},${size.height}`}
                >
                  <Box ref={container} sx={size}>
                    <Stage
                      {...size}
                      options={{
                        antialias: true,
                        powerPreference: "high-performance",
                      }}
                    >
                      <Graphics
                        draw={$bg(
                          theme.palette.background.default,
                          size.width,
                          size.height
                        )}
                      />
                      <Viewport {...size} onViewport={setViewport}>
                        <Container>
                          <Graphics draw={drawMap} />
                          {showGrid && <Graphics draw={drawGrid} alpha={0.1} />}
                          <Graphics draw={drawAgents} />
                          {selection.show && <Graphics draw={drawAgent} />}
                          {zip(
                            getAgentPositions(t0),
                            getAgentPositions(t1),
                            getAgentPositions(t2)
                          ).map(([p0, p1, p2], i) => {
                            const [nextDidMove, prevDidMove] = [
                              p2.x !== p1.x || p2.y !== p1.y,
                              p1.x !== p0.x || p1.y !== p0.y,
                            ];
                            const [nextAngle, prevAngle] = [
                              getAngle(p1 ?? p0, p2 ?? p0),
                              getAngle(p0, p1 ?? p0),
                            ];
                            return (
                              <Arrow
                                opacity={lerp(+prevDidMove, +nextDidMove, dt)}
                                position={{
                                  x: lerp(p0.x, p1.x, dt),
                                  y: lerp(p0.y, p1.y, dt),
                                }}
                                color={getAgentColor(i)}
                                rotation={lerpCircle(
                                  prevDidMove ? prevAngle : nextAngle,
                                  nextDidMove ? nextAngle : prevAngle,
                                  dt
                                )}
                                key={i}
                              />
                            );
                          })}
                          <Graphics draw={drawBox} alpha={0.1} />
                        </Container>
                      </Viewport>
                    </Stage>
                  </Box>
                </Fade>
              )}
              <Stack
                sx={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  maxWidth: "100%",
                  // p: 4,
                }}
              >
                <Card sx={{ py: 1, m: sm ? 2 : 3, px: 2, ...paper() }}>
                  <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
                    {!sm && (
                      <>
                        <Typography sx={{ px: 2 }}>
                          {step} / {timespan}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                      </>
                    )}
                    {[
                      {
                        name: "Restart",
                        icon: <FirstPageOutlined />,
                        action: restart,
                      },
                      {
                        name: "Step back",
                        icon: <ChevronLeftOutlined />,
                        action: backwards,
                      },
                      {
                        name: paused ? "Play" : "Pause",
                        icon: paused ? (
                          <PlayArrowOutlined sx={{ color: "primary.main" }} />
                        ) : (
                          <PauseOutlined sx={{ color: "primary.main" }} />
                        ),
                        action: paused ? play : pause,
                      },
                      {
                        name: "Step forward",
                        icon: <ChevronRightOutlined />,
                        action: forwards,
                      },
                    ].map(({ name, icon, action }) => (
                      <Tooltip title={name} key={name}>
                        <IconButton onClick={action}>{icon}</IconButton>
                      </Tooltip>
                    ))}
                    <Divider orientation="vertical" flexItem />
                    <Slider
                      value={step}
                      onChange={(_, n) => seek(+n)}
                      min={0}
                      max={timespan}
                      step={1}
                      sx={{
                        "& *": { transition: "none !important" },
                        mx: 2,
                        width: 240,
                        flex: 1,
                      }}
                    />
                  </Stack>
                </Card>
              </Stack>
              <Enter in={selection.show} axis="X" key={selection.agent}>
                <Stack
                  sx={{
                    ...paper(1),
                    position: "absolute",
                    top: 0,
                    right: 0,
                    m: sm ? 2 : 3,
                  }}
                >
                  {!isUndefined(selection.agent) && (
                    <>
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          py: 0.5,
                          px: 2,
                          gap: 4,
                        }}
                      >
                        <Typography sx={{ flex: 1 }}>
                          <Dot
                            sx={{ bgcolor: getAgentColor(selection.agent) }}
                          />
                          Agent {selection.agent}
                        </Typography>
                        <IconButton
                          edge="end"
                          onClick={() => setSelection({ show: false })}
                        >
                          <CloseOutlined />
                        </IconButton>
                      </Stack>
                      <Stack sx={{ p: 2, minWidth: 180 }}>
                        <Item
                          invert
                          primary={getAgentPath(selection.agent).length - 1}
                          secondary="Cost"
                        />
                        {[
                          {
                            name: "Moving",
                            value: proportionOf(
                              getAgentPath(selection.agent),
                              (p) => p.action !== "w"
                            ),
                          },
                          {
                            name: "Waiting",
                            value: proportionOf(
                              getAgentPath(selection.agent),
                              (p) => p.action === "w"
                            ),
                          },
                        ].map(({ name, value }) => (
                          <Item
                            invert
                            key={name}
                            primary={
                              <Bar
                                values={[
                                  {
                                    label: name,
                                    value: value,
                                    color: getAgentColor(selection.agent),
                                  },
                                ]}
                              />
                            }
                            secondary={name}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              </Enter>
            </>
          )}
        </AutoSize>
      )}
    </Box>
  );
}

function proportionOf<T>(xs: T[], f: (x: T) => boolean): number {
  return xs.filter(f).length / xs.length;
}
