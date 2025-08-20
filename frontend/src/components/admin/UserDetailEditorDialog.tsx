import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { LockOpen } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DialogProps, useNotifications } from "@toolpad/core";

import AdministrateUserSignatures from "@/components/admin/AdministrateUserSignatures";
import UserDetailsEditor from "@/components/user/user-detail-editor/UserDetailsEditor";
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

  const unlockUserMatchesMutation = useMutation({
    mutationFn: () =>
      client.user_matches.lock.$post({
        customerId: userDetail.id,
        userMatchesLocked: false,
      }),
    onSuccess: () =>
      notifications.show("Overleveringene ble låst opp!", SUCCESS_NOTIFICATION),
    onError: () =>
      notifications.show(
        "Klarte ikke låse opp overleveringene",
        ERROR_NOTIFICATION,
      ),
  });

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Rediger brukerdetaljer</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Button
            sx={{ mb: 3 }}
            startIcon={<LockOpen />}
            variant="contained"
            onClick={() => unlockUserMatchesMutation.mutate()}
            loading={unlockUserMatchesMutation.isPending}
          >
            Lås opp overleveringer
          </Button>
          <UserDetailsEditor
            variant={"administrate"}
            userDetails={userDetail}
          />
          <AdministrateUserSignatures userDetail={userDetail} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Lukk</Button>
      </DialogActions>
    </Dialog>
  );
}
