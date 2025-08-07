import { UserDetail } from "@boklisten/backend/shared/user-detail";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { DialogProps } from "@toolpad/core";

import AdministrateUserSignatures from "@/components/admin/AdministrateUserSignatures";
import UserDetailsEditor from "@/components/user/user-detail-editor/UserDetailsEditor";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

export default function UserDetailEditorDialog({
  payload,
  open,
  onClose,
}: DialogProps<{
  initialUserDetails: UserDetail;
}>) {
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

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Rediger brukerdetaljer</DialogTitle>
      <DialogContent>
        <Box mt={1}>
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
