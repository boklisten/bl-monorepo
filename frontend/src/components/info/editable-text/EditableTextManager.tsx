"use client";

import { NoteAdd } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Alert, AlertTitle, Box, Button, Stack, Tooltip } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDialogs, useNotifications } from "@toolpad/core";
import { useState } from "react";

import EditableTextEditorDialog from "@/components/info/editable-text/EditableTextEditorDialog";
import useApiClient from "@/utils/api/useApiClient";

export default function EditableTextManager() {
  const client = useApiClient();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const [isMutating, setIsMutating] = useState(false);

  const destroyEditableTextMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsMutating(true);
      return await client.editable_texts({ id: id }).$delete().unwrap();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [client.editable_texts.$url()],
      });
      setIsMutating(false);
    },
    onSuccess: async () => {
      notifications.show("Dynamisk innhold ble slettet!", {
        severity: "success",
        autoHideDuration: 3000,
      });
    },
    onError: async () => {
      notifications.show("Klarte ikke slette dynamisk innhold!", {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
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
      headerName: "Nøkkel",
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
              onClick={() => destroyEditableTextMutation.mutate(id as string)}
            />
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    <Stack>
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
        loading={isLoading || isMutating}
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
