"use client";
// MRT does not support React Compiler yet
"use no memo";

import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
// @ts-expect-error MRT has bad types, hopefully they fix this in the future
import { MRT_Localization_NO } from "mantine-react-table/locales/no";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import EditableTextEditor from "@/shared/components/editable-text/EditableTextEditor";
import useApiClient from "@/shared/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function EditableTextTable() {
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

  const table = useMantineReactTable({
    columns: [
      {
        accessorKey: "key",
        header: "Unik nøkkel",
      },
    ],
    data: editableTexts ?? [],
    enableEditing: true,
    state: {
      isLoading: isLoading || destroyEditableTextMutation.isPending,
    },
    getRowId: (editableText) => editableText.id,
    renderRowActions: ({ row, table }) => (
      <>
        <Tooltip key={`edit-${row.id}`} label={"Endre"}>
          <ActionIcon
            variant={"subtle"}
            onClick={() => table.setEditingRow(row)}
          >
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip key={`delete-${row.id}`} label={"Slett"}>
          <ActionIcon
            variant={"subtle"}
            color={"red"}
            onClick={async () => {
              modals.openConfirmModal({
                title: "Bekreft sletting av dynamisk innhold",
                children:
                  "Hvis du sletter dette innholdet, vil sider som bruker denne teksten slutte å fungere. Sjekk at ingen sider er avhengige av denne nøkkelen før du fortsetter.",
                confirmProps: { color: "red" },
                labels: { cancel: "Avbryt", confirm: "Slett" },
                onConfirm: () => destroyEditableTextMutation.mutate(row.id),
              });
            }}
          >
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <Button onClick={() => table.setCreatingRow(true)}>Legg til</Button>
    ),
    mantineCreateRowModalProps: {
      size: "xl",
    },
    mantineEditRowModalProps: {
      size: "xl",
    },
    renderCreateRowModalContent: ({ table }) => (
      <EditableTextEditor onClose={() => table.setCreatingRow(null)} />
    ),
    renderEditRowModalContent: ({ table, row }) => (
      <EditableTextEditor
        editableText={editableTexts?.find(
          (editableText) => editableText.id === row.id,
        )}
        onClose={() => table.setEditingRow(null)}
      />
    ),
    localization: MRT_Localization_NO,
  });

  if (error) {
    return (
      <ErrorAlert title={"Klarte ikke laste inn dynamisk innhold"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  return <MantineReactTable table={table} />;
}
