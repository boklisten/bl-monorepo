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
import useApiClient from "@/utils/api/useApiClient";

function SuccessfulUploadDialog({
  payload,
  open,
  onClose,
}: DialogProps<{
  unknownSubjects: string[];
  unknownUsers: { subjects: string[]; phone: string }[];
  successfulOrders: number;
}>) {
  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Opplasting av fagvalg var vellykket</DialogTitle>
      <DialogContent>
        <Stack>
          <Typography variant={"h5"} sx={{ mb: 5 }}>
            {`${payload.successfulOrders} har fått bestillinger for fagvalgene sine!`}
          </Typography>
          {payload.unknownSubjects.length > 0 && (
            <>
              <Typography
                variant={"h6"}
              >{`${payload.unknownSubjects.length} fag ble ikke funnet:`}</Typography>
              <List>
                {payload.unknownSubjects.map((subject) => (
                  <ListItem key={subject}>
                    <ListItemText>{subject}</ListItemText>
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {payload.unknownUsers.length > 0 && (
            <>
              <Typography
                variant={"h6"}
              >{`${payload.unknownUsers.length} brukere ble ikke funnet:`}</Typography>
              <List>
                {payload.unknownUsers.map(({ subjects, phone }) => (
                  <ListItem key={phone}>
                    <ListItemText>{`${phone} - ${subjects.join(", ")}`}</ListItemText>
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

export default function UploadSubjectChoices({
  branchId,
}: {
  branchId: string;
}) {
  const client = useApiClient();
  const dialogs = useDialogs();

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
    onSuccess: (data) => dialogs.open(SuccessfulUploadDialog, data),
    onError: () =>
      dialogs.alert("Opplasting av fagvalg feilet!", {
        title: "Feilmelding",
      }),
  });
  return (
    <UploadCSVFile
      loading={uploadSubjectChoicesMutation.isPending}
      label={"Last opp fagvalg"}
      allowedHeaders={["phone", "subjects"] as const}
      onUpload={uploadSubjectChoicesMutation.mutate}
    />
  );
}
