"use client";

import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
// @ts-expect-error MRT has bad types, hopefully they fix this in the future
import { MRT_Localization_NO } from "mantine-react-table/locales/no";
import { useEffect, useState } from "react";

import EditableTextEditor from "@/components/info/editable-text/EditableTextEditor";
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
  const [counter, setCounter] = useState(0);

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
            onClick={() => {
              setCounter((prev) => prev + 1);
              table.setEditingRow(row);
            }}
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
      <Button
        onClick={() => {
          setCounter((prev) => prev + 1);
          table.setCreatingRow(true);
        }}
      >
        Legg til
      </Button>
    ),
    renderCreateRowModalContent: ({ table }) => (
      <EditableTextEditor
        onClose={() => {
          setCounter((prev) => prev + 1);
          table.setCreatingRow(null);
        }}
      />
    ),
    renderEditRowModalContent: ({ table, row }) => (
      <EditableTextEditor
        editableText={editableTexts?.find(
          (editableText) => editableText.id === row.id,
        )}
        onClose={() => {
          setCounter((prev) => prev + 1);
          table.setEditingRow(null);
        }}
      />
    ),
    localization: MRT_Localization_NO,
  });

  useEffect(() => {
    setCounter((prev) => prev + 1);
  }, [editableTexts, isLoading, error]);

  if (error) {
    return (
      <ErrorAlert title={"Klarte ikke laste inn dynamisk innhold"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  return (
    <MantineReactTable
      // Hack to force rerenders, MRT has some issues
      key={`force-update:${counter}`}
      table={table}
    />
  );
}
