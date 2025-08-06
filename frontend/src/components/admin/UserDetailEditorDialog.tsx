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
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DialogProps, useNotifications } from "@toolpad/core";

import UserDetailsEditor from "@/components/user/user-detail-editor/UserDetailsEditor";
import unpack from "@/utils/api/bl-api-request";
import { publicApiClient } from "@/utils/api/publicApiClient";
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

  const { data: signatureResponse } = useQuery({
    queryKey: [
      publicApiClient.signatures.valid({ detailsId: userDetail.id }).$url(),
      userDetail.id,
    ],
    queryFn: () =>
      publicApiClient.signatures
        .valid({ detailsId: userDetail.id })
        .$get()
        .unwrap(),
  });
  const requestSignatureMutation = useMutation({
    mutationFn: () =>
      client.signatures.send({ detailsId: userDetail.id }).$post().unwrap(),
    onSuccess: () =>
      notifications.show(
        "Signaturforespørsel har blitt sendt!",
        SUCCESS_NOTIFICATION,
      ),
    onError: () =>
      notifications.show(
        "Klarte ikke sende signaturforespørsel",
        ERROR_NOTIFICATION,
      ),
  });

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Rediger brukerdetaljer</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <UserDetailsEditor
            variant={"administrate"}
            userDetails={userDetail}
          />
          {!signatureResponse?.isSignatureValid ? (
            <Alert severity={"warning"}>
              <Stack gap={1}>
                <AlertTitle>Denne kunden har ikke gyldig signatur</AlertTitle>
                <Button
                  loading={requestSignatureMutation.isPending}
                  onClick={() => requestSignatureMutation.mutate()}
                >
                  Send signeringslenke på nytt
                </Button>
              </Stack>
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
