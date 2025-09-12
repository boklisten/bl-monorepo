"use client";
// IMPORTANT: keep this outside of global.css to avoid overwriting globals
import "@blocknote/mantine/style.css";

import { Box, Button, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import useApiClient from "@/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function EditableTextManager() {
  const client = useApiClient();
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
      <ErrorAlert title={"Klarte ikke laste inn dynamisk innhold"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
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
          <Tooltip key={`edit-${id}`} label={"Endre"}>
            <GridActionsCellItem
              icon={<IconEdit />}
              label="Rediger"
              onClick={() =>
                modals.openContextModal({
                  size: "xl",
                  title: "Rediger innhold",
                  modal: "editableTextEditor",
                  innerProps: {
                    editableText: editableTexts?.find(
                      (editableText) => editableText.id === id,
                    ),
                  },
                })
              }
            />
          </Tooltip>,
          <Tooltip key={`delete-${id}`} label={"Slett"}>
            <GridActionsCellItem
              icon={<IconTrash />}
              label="Slett"
              onClick={async () => {
                modals.openConfirmModal({
                  title: "Bekreft sletting av dynamisk innhold",
                  children:
                    "Hvis du sletter dette innholdet, vil sider som bruker denne teksten slutte å fungere. Sjekk at ingen sider er avhengige av denne nøkkelen før du fortsetter.",
                  confirmProps: { color: "red" },
                  labels: { cancel: "Avbryt", confirm: "Slett" },
                  onConfirm: () =>
                    destroyEditableTextMutation.mutate(id as string),
                });
              }}
            />
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    <>
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
          leftSection={<IconPlus />}
          onClick={() =>
            modals.openContextModal({
              size: "xl",
              title: "Opprett innhold",
              modal: "editableTextEditor",
              innerProps: {},
            })
          }
        >
          Legg til
        </Button>
      </Box>
    </>
  );
}
