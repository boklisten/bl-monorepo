import { modals } from "@mantine/modals";
import { Typography, Stack, ListItem, List } from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import { useMutation } from "@tanstack/react-query";

import UploadCSVFile from "@/components/UploadCSVFile";
import useApiClient from "@/hooks/useApiClient";
import { showErrorNotification } from "@/utils/notifications";

function SuccessfulUploadDialog({
  unknownBranches,
  unknownRecords,
  matchedUsers,
}: {
  unknownBranches: string[];
  unknownRecords: { branch: string; phone: string }[];
  matchedUsers: number;
}) {
  return (
    <Stack>
      <Typography variant={"h5"} sx={{ mb: 5 }}>
        {`${matchedUsers} brukere ble oppdatert!`}
      </Typography>
      {unknownBranches.length > 0 && (
        <>
          <Typography
            variant={"h6"}
          >{`${unknownBranches.length} filialer ble ikke funnet:`}</Typography>
          <List>
            {unknownBranches.map((branchName) => (
              <ListItem key={branchName}>
                <ListItemText>{branchName}</ListItemText>
              </ListItem>
            ))}
          </List>
        </>
      )}
      {unknownRecords.length > 0 && (
        <>
          <Typography
            variant={"h6"}
          >{`${unknownRecords.length} brukere ble ikke funnet:`}</Typography>
          <List>
            {unknownRecords.map(({ branch, phone }) => (
              <ListItem key={phone}>
                <ListItemText>{`${branch} - ${phone}`}</ListItemText>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Stack>
  );
}

export default function UploadClassMemberships({
  branchId,
}: {
  branchId: string;
}) {
  const client = useApiClient();

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
    onSuccess: (data) =>
      modals.open({
        title: "Opplasting av klassevalg var vellykket",
        children: (
          <SuccessfulUploadDialog
            unknownBranches={data.unknownBranches}
            unknownRecords={data.unknownRecords}
            matchedUsers={data.matchedUsers}
          />
        ),
      }),
    onError: () => showErrorNotification("Opplasting av klassevalg feilet!"),
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
