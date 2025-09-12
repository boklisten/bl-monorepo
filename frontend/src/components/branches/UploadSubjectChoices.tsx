import { List, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMutation } from "@tanstack/react-query";

import UploadCSVFile from "@/components/UploadCSVFile";
import useApiClient from "@/hooks/useApiClient";
import { showErrorNotification } from "@/utils/notifications";

function SuccessfulUploadDialog({
  unknownSubjects,
  unknownUsers,
  successfulOrders,
}: {
  unknownSubjects: string[];
  unknownUsers: { subjects: string[]; phone: string }[];
  successfulOrders: number;
}) {
  return (
    <Stack>
      <Text>
        {`${successfulOrders} har fått bestillinger for fagvalgene sine!`}
      </Text>
      {unknownSubjects.length > 0 && (
        <>
          <Text>{`${unknownSubjects.length} fag ble ikke funnet:`}</Text>
          <List>
            {unknownSubjects.map((subject) => (
              <List.Item key={subject}>{subject}</List.Item>
            ))}
          </List>
        </>
      )}
      {unknownUsers.length > 0 && (
        <>
          <Text>{`${unknownUsers.length} brukere ble ikke funnet:`}</Text>
          <List>
            {unknownUsers.map(({ subjects, phone }) => (
              <List.Item key={phone}>
                {`${phone} - ${subjects.join(", ")}`}
              </List.Item>
            ))}
          </List>
        </>
      )}
    </Stack>
  );
}

export default function UploadSubjectChoices({
  branchId,
}: {
  branchId: string;
}) {
  const client = useApiClient();

  const uploadSubjectChoicesMutation = useMutation({
    mutationFn: (
      subjectChoices: {
        phone: string | string[];
        subjects: string | string[];
      }[],
    ) =>
      client.v2.branches.subject_choices
        .$post({
          subjectChoices: subjectChoices.map((subjectChoice) => ({
            phone: subjectChoice.phone as string,
            subjects: [subjectChoice.subjects].flat(),
          })),
          branchId,
        })
        .unwrap(),
    onSuccess: (data) =>
      modals.open({
        title: "Opplasting av fagvalg var vellykket",
        children: (
          <SuccessfulUploadDialog
            unknownSubjects={data.unknownSubjects}
            unknownUsers={data.unknownUsers}
            successfulOrders={data.successfulOrders}
          />
        ),
      }),
    onError: () => showErrorNotification("Opplasting av fagvalg feilet!"),
  });
  return (
    <UploadCSVFile
      label={"Last opp fagvalg"}
      requiredHeaders={["phone", "subjects"] as const}
      onUpload={uploadSubjectChoicesMutation.mutate}
    />
  );
}
