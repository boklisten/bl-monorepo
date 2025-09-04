import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Stack,
  ListItem,
  List,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import { useMutation } from "@tanstack/react-query";
import { useDialogs, DialogProps } from "@toolpad/core";

import UploadCSVFile from "@/components/UploadCSVFile";
import useApiClient from "@/hooks/useApiClient";

function SuccessfulUploadDialog({
  payload,
  open,
  onClose,
}: DialogProps<{
  unknownBranches: string[];
  unknownRecords: { branch: string; phone: string }[];
  matchedUsers: number;
}>) {
  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Opplasting av klassevalg var vellykket</DialogTitle>
      <DialogContent>
        <Stack>
          <Typography variant={"h5"} sx={{ mb: 5 }}>
            {`${payload.matchedUsers} brukere ble oppdatert!`}
          </Typography>
          {payload.unknownBranches.length > 0 && (
            <>
              <Typography
                variant={"h6"}
              >{`${payload.unknownBranches.length} filialer ble ikke funnet:`}</Typography>
              <List>
                {payload.unknownBranches.map((branchName) => (
                  <ListItem key={branchName}>
                    <ListItemText>{branchName}</ListItemText>
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {payload.unknownRecords.length > 0 && (
            <>
              <Typography
                variant={"h6"}
              >{`${payload.unknownRecords.length} brukere ble ikke funnet:`}</Typography>
              <List>
                {payload.unknownRecords.map(({ branch, phone }) => (
                  <ListItem key={phone}>
                    <ListItemText>{`${branch} - ${phone}`}</ListItemText>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Lukk</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function UploadClassMemberships({
  branchId,
}: {
  branchId: string;
}) {
  const client = useApiClient();
  const dialogs = useDialogs();

  const uploadClassMembershipMutation = useMutation({
    mutationFn: (
      membershipData: { branch: string | string[]; phone: string | string[] }[],
    ) =>
      client.v2.branches.memberships
        .$post({
          membershipData: membershipData as { branch: string; phone: string }[],
          branchId,
        })
        .unwrap(),
    onSuccess: (data) => dialogs.open(SuccessfulUploadDialog, data),
    onError: () =>
      dialogs.alert("Opplasting av klassevalg feilet!", {
        title: "Feilmelding",
      }),
  });

  return (
    <UploadCSVFile
      loading={uploadClassMembershipMutation.isPending}
      label={"Last opp klassevalg"}
      requiredHeaders={["phone", "branch"] as const}
      onUpload={uploadClassMembershipMutation.mutate}
    />
  );
}
