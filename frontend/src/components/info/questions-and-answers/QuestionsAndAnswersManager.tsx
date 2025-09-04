"use client";

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
import { useDialogs, useNotifications } from "@toolpad/core";

import QuestionAndAnswerEditDialog from "@/components/info/questions-and-answers/QuestionAndAnswerEditDialog";
import useApiClient from "@/hooks/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

export default function QuestionsAndAnswersManager() {
  const client = useApiClient();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const destroyQuestionAndAnswerMutation = useMutation({
    mutationFn: (id: string) =>
      client.questions_and_answers({ id: id }).$delete().unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.questions_and_answers.$url()],
      }),
    onSuccess: () =>
      notifications.show("Spørsmål og svar ble slettet!", SUCCESS_NOTIFICATION),
    onError: () =>
      notifications.show(
        "Klarte ikke slette spørsmål og svar!",
        ERROR_NOTIFICATION,
      ),
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
                dialogs.open(
                  QuestionAndAnswerEditDialog,
                  questionsAndAnswers?.find((entry) => entry.id === id),
                )
              }
            />
          </Tooltip>,
          <Tooltip key={`delete-${id}`} title={"Slett"}>
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Slett"
              onClick={async () => {
                if (
                  await dialogs.confirm("Dette kan ikke angres.", {
                    severity: "error",
                    title: "Bekreft sletting av spørsmål og svar",
                    okText: "Slett",
                    cancelText: "Avbryt",
                  })
                ) {
                  destroyQuestionAndAnswerMutation.mutate(id as string);
                }
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
          onClick={async () => {
            await dialogs.open(QuestionAndAnswerEditDialog);
          }}
        >
          Legg til
        </Button>
      </Box>
    </Stack>
  );
}
