import { List, Stack, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMutation } from "@tanstack/react-query";

import useApiClient from "@/shared/api/useApiClient";
import { showErrorNotification } from "@/shared/ui/notifications";
import UploadCSVFile from "@/shared/UploadCSVFile";

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
      <Title order={5}>{`${matchedUsers} brukere ble oppdatert!`}</Title>
      {unknownBranches.length > 0 && (
        <>
          <Title
            order={6}
          >{`${unknownBranches.length} filialer ble ikke funnet:`}</Title>
          <List>
            {unknownBranches.map((branchName) => (
              <List.Item key={branchName}>{branchName}</List.Item>
            ))}
          </List>
        </>
      )}
      {unknownRecords.length > 0 && (
        <>
          <Title
            order={6}
          >{`${unknownRecords.length} brukere ble ikke funnet:`}</Title>
          <List>
            {unknownRecords.map(({ branch, phone }) => (
              <List.Item key={phone}>{`${branch} - ${phone}`}</List.Item>
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
      label={"Last opp klassevalg"}
      requiredHeaders={["phone", "branch"] as const}
      onUpload={uploadClassMembershipMutation.mutate}
    />
  );
}
