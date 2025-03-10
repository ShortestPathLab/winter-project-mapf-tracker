import { ExpandRounded, SendRounded } from "@mui-symbols-material/w400";
import {
  Button,
  ButtonGroup,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import Accordion from "components/Accordion";
import { useSnackbar } from "components/Snackbar";
import { Dialog } from "components/dialog";
import { useSm } from "components/dialog/useSmallDisplay";
import { SubmissionKeyRequestForm } from "forms/SubmissionKeyRequestForm";
import { DialogContentProps, useDialog } from "hooks/useDialog";
import { Grid } from "layout";
import { delay } from "lodash";
import { paper } from "theme";
import {
  RequestWithReviewOutcome,
  useRequestsUpdateMutation,
} from "../../../queries/useRequestsQuery";
import { ConfirmNotifyDialog } from "./ConfirmNotifyDialog";
import { SetReviewOutcomeForm } from "./SetReviewOutcomeForm";

export function ReviewRequestDialog({
  data,
  onClose,
  onProps,
}: { data?: RequestWithReviewOutcome } & DialogContentProps) {
  const { transitions } = useTheme();
  const sm = useSm();
  const notify = useSnackbar();
  const { open: showConfirmation, dialog: confirmationDialog } = useDialog(
    ConfirmNotifyDialog,
    {
      padded: true,
      slotProps: { modal: { variant: "default" } },
      title: "Respond to request",
    }
  );
  const { mutateAsync: updateRequest } = useRequestsUpdateMutation();
  return (
    <Grid sx={{ gap: sm ? 4 : 3 }} width={420}>
      <Stack>
        <Accordion
          sx={{ p: sm ? 2 : 3, ...paper(0) }}
          slotProps={{
            label: { variant: "h5" },
            summary: { sx: { py: 0, my: -2 } },
          }}
          label="Request details"
          defaultExpanded={!sm}
        >
          <SubmissionKeyRequestForm initialValues={data} disabled />
        </Accordion>
      </Stack>
      <Stack sx={{ gap: 4 }}>
        <Typography variant="h5">Request outcome</Typography>
        <SetReviewOutcomeForm
          onTouched={() => onProps?.({ preventClose: true })}
          onSubmit={async (values) => {
            notify("Saving changes");
            await updateRequest({
              id: data?.id,
              value: {
                ...data,
                reviewStatus: values,
              },
            });
            notify("Changes saved");
          }}
          initialValues={data?.reviewStatus}
          submit={({ submitForm, values }) => (
            <ButtonGroup>
              <Button
                sx={{ flex: 1 }}
                variant="contained"
                onClick={async () => {
                  await submitForm();
                  onClose?.();
                }}
              >
                Save changes
              </Button>
              <Dialog
                popover
                title="More save options"
                trigger={(onClick) => (
                  <Button {...{ onClick }} variant="contained" sx={{ px: 1 }}>
                    <ExpandRounded />
                  </Button>
                )}
                slotProps={{
                  paper: {
                    sx: { width: "max-content" },
                  },
                  popover: {
                    anchorOrigin: { horizontal: "right", vertical: "bottom" },
                    transformOrigin: { horizontal: "right", vertical: "top" },
                  },
                }}
              >
                <List>
                  <ListItemButton
                    onClick={async () => {
                      await submitForm();
                      showConfirmation({
                        data: { ...data, reviewStatus: values },
                        onClose: () =>
                          delay(
                            () => onClose?.(),
                            transitions.duration.shortest
                          ),
                      });
                    }}
                  >
                    <ListItemIcon>
                      <SendRounded />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Save and send a response to ${data?.requesterEmail}`}
                    />
                  </ListItemButton>
                </List>
              </Dialog>
            </ButtonGroup>
          )}
        />
      </Stack>
      {confirmationDialog}
    </Grid>
  );
}
