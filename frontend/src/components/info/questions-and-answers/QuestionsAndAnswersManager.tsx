"use client";

import { modals } from "@mantine/modals";
import { NoteAdd } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function QuestionsAndAnswersManager() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const destroyQuestionAndAnswerMutation = useMutation({
    mutationFn: (id: string) =>
      client.questions_and_answers({ id: id }).$delete().unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.questions_and_answers.$url()],
      }),
    onSuccess: () => showSuccessNotification("Spørsmål og svar ble slettet!"),
    onError: () =>
      showErrorNotification("Klarte ikke slette spørsmål og svar!"),
  });

  const {
    data: questionsAndAnswers,
    isLoading,
    error,
  } = useQuery({
    queryKey: [client.questions_and_answers.$url()],
    queryFn: () => client.questions_and_answers.$get().unwrap(),
  });

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Klarte ikke laste inn spørsmål og svar</AlertTitle>
        Du kan prøve igjen, eller ta kontakt dersom problemet vedvarer.
      </Alert>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "question",
      headerName: "Spørsmål",
      width: 200,
    },
    {
      field: "answer",
      headerName: "Svar",
      width: 200,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Handlinger",
      width: 100,
      getActions: ({ id }) => {
        return [
          <Tooltip key={`edit-${id}`} title={"Endre"}>
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Rediger"
              onClick={() =>
                modals.openContextModal({
                  title: "Rediger spørsmål og svar",
                  innerProps: {
                    questionAndAnswer: questionsAndAnswers?.find(
                      (entry) => entry.id === id,
                    ),
                  },
                  modal: "questionAndAnswerEdit",
                })
              }
            />
          </Tooltip>,
          <Tooltip key={`delete-${id}`} title={"Slett"}>
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Slett"
              onClick={async () => {
                modals.openConfirmModal({
                  // TODO: severity: "error",
                  title: "Bekreft sletting av spørsmål og svar",
                  children: "Dette kan ikke angres.",
                  confirmProps: { color: "red" },
                  labels: { cancel: "Avbryt", confirm: "Slett" },
                  onConfirm: () =>
                    destroyQuestionAndAnswerMutation.mutate(id as string),
                });
              }}
            />
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    <Stack>
      <Typography variant={"h2"}>Spørsmål og svar</Typography>
      <DataGrid
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5, 10, 100]}
        rows={questionsAndAnswers ?? []}
        loading={isLoading || destroyQuestionAndAnswerMutation.isPending}
        columns={columns}
        disableRowSelectionOnClick
        sx={{ border: 0 }}
      />
      <Box>
        <Button
          variant="contained"
          startIcon={<NoteAdd />}
          onClick={() =>
            modals.openContextModal({
              title: "Opprett spørsmål og svar",
              modal: "questionAndAnswerEdit",
              innerProps: {},
            })
          }
        >
          Legg til
        </Button>
      </Box>
    </Stack>
  );
}
