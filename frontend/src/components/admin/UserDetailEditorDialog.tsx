import { UserDetail } from "@boklisten/backend/shared/user-detail";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DialogProps, useNotifications } from "@toolpad/core";
import moment from "moment";

import UserDetailsEditor, {
  isUnder18,
} from "@/components/user/user-detail-editor/UserDetailsEditor";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

export default function UserDetailEditorDialog({
  payload,
  open,
  onClose,
}: DialogProps<{
  initialUserDetails: UserDetail;
}>) {
  const notifications = useNotifications();
  const client = useApiClient();
  const { data: updatedUserDetails } = useQuery({
    queryKey: ["userDetails", payload.initialUserDetails.id],
    queryFn: () =>
      client
        .$route("collection.userdetails.getId", {
          id: payload.initialUserDetails.id,
        })
        .$get()
        .then(unpack<[UserDetail]>),
  });
  const userDetail = updatedUserDetails?.[0] ?? payload.initialUserDetails;

  const requestGuardianSignatureMutation = useMutation({
    mutationFn: () =>
      client.signatures.send({ detailsId: userDetail.id }).$post().unwrap(),
    onSuccess: () =>
      notifications.show(
        "Foresatt-signatur har blitt sendt!",
        SUCCESS_NOTIFICATION,
      ),
    onError: () =>
      notifications.show(
        "Klarte ikke sende foresatt-signatur",
        ERROR_NOTIFICATION,
      ),
  });
  const isUnderage = isUnder18(moment(new Date(userDetail.dob)));

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Rediger brukerdetaljer</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <UserDetailsEditor
            variant={"administrate"}
            userDetails={userDetail}
          />
          {userDetail.signatures.length === 0 ? (
            // fixme: improve this check to check for guardian signatures etc, make new endpoint in signatures controller
            <Alert severity={"warning"}>
              <Tooltip
                title={
                  isUnderage
                    ? ""
                    : "Denne kunder er over 18 år og trenger derfor ikke signatur fra foresatt. Kunder kan signere ved å gå gjennom bestillingsrutinen"
                }
              >
                <Stack gap={1}>
                  <AlertTitle>Denne kunden har ikke gyldig signatur</AlertTitle>
                  <Button
                    loading={requestGuardianSignatureMutation.isPending}
                    disabled={!isUnderage}
                    onClick={() => requestGuardianSignatureMutation.mutate()}
                  >
                    Send signeringslenke til foresatt på nytt
                  </Button>
                </Stack>
              </Tooltip>
            </Alert>
          ) : (
            <Alert severity={"success"}>Denne kunden har gyldig signatur</Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Lukk</Button>
      </DialogActions>
    </Dialog>
  );
}
