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
import { useDialogs } from "@toolpad/core";

import EditableTextEditorDialog from "@/components/info/editable-text/EditableTextEditorDialog";
import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function EditableTextManager() {
  const client = useApiClient();
  const dialogs = useDialogs();
  const queryClient = useQueryClient();

  const destroyEditableTextMutation = useMutation({
    mutationFn: (id: string) =>
      client.editable_texts({ id: id }).$delete().unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.editable_texts.$url()],
      }),
    onSuccess: () => showSuccessNotification("Dynamisk innhold ble slettet!"),
    onError: () =>
      showErrorNotification("Klarte ikke slette dynamisk innhold!"),
  });

  const {
    data: editableTexts,
    isLoading,
    error,
  } = useQuery({
    queryKey: [client.editable_texts.$url()],
    queryFn: () => client.editable_texts.$get().unwrap(),
  });

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Klarte ikke laste inn dynamisk innhold</AlertTitle>
        Du kan prøve igjen, eller ta kontakt dersom problemet vedvarer.
      </Alert>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "key",
      headerName: "Unik Nøkkel",
      width: 150,
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
                  EditableTextEditorDialog,
                  editableTexts?.find((editableText) => editableText.id === id),
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
                  await dialogs.confirm(
                    "Hvis du sletter dette innholdet, vil sider som bruker denne teksten slutte å fungere. Sjekk at ingen sider er avhengige av denne nøkkelen før du fortsetter.",
                    {
                      severity: "error",
                      title: "Bekreft sletting av dynamisk innhold",
                      okText: "Slett",
                      cancelText: "Avbryt",
                    },
                  )
                ) {
                  destroyEditableTextMutation.mutate(id as string);
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
      <Typography variant={"h2"}>Tekst</Typography>
      <DataGrid
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5, 10, 100]}
        rows={editableTexts ?? []}
        loading={isLoading || destroyEditableTextMutation.isPending}
        columns={columns}
        disableRowSelectionOnClick
        sx={{ border: 0 }}
      />
      <Box>
        <Button
          variant="contained"
          startIcon={<NoteAdd />}
          onClick={async () => {
            await dialogs.open(EditableTextEditorDialog);
          }}
        >
          Legg til
        </Button>
      </Box>
    </Stack>
  );
}
