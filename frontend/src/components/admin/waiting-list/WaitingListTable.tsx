// MRT does not support React Compiler yet
"use no memo";

import { Branch } from "@boklisten/backend/shared/branch";
import { Item } from "@boklisten/backend/shared/item";
import { WaitingListEntry } from "@boklisten/backend/shared/waiting-list-entry";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
// @ts-expect-error MRT has bad types, hopefully they fix this in the future
import { MRT_Localization_NO } from "mantine-react-table/locales/no";

import CreateWaitingListEntry from "@/components/admin/waiting-list/CreateWaitingListEntry";
import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function WaitingListTable({
  loading,
  items,
  branches,
  waitingList,
}: {
  loading: boolean;
  items: Item[];
  branches: Branch[];
  waitingList: WaitingListEntry[];
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const destroyWaitingListEntryMutation = useMutation({
    mutationFn: (id: string) =>
      client.waiting_list_entries({ id }).$delete().unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.waiting_list_entries.$url()],
      }),
    onSuccess: () =>
      showSuccessNotification("Ventelisteoppføring ble slettet!"),
    onError: async () =>
      showErrorNotification("Klarte ikke slette ventelisteoppføring!"),
  });

  const table = useMantineReactTable({
    columns: [
      {
        accessorKey: "customerName",
        header: "Navn",
      },
      {
        accessorKey: "customerPhone",
        header: "Telefonnummer",
      },
      {
        accessorFn: (waitingListEntry) =>
          items.find((item) => item.id === waitingListEntry.itemId)?.title,
        header: "Bok",
      },
      {
        accessorFn: (waitingListEntry) =>
          branches.find((branch) => branch.id === waitingListEntry.branchId)
            ?.name,
        header: "Filial",
      },
    ],
    data: waitingList,
    enableEditing: true,
    state: {
      isLoading: loading || destroyWaitingListEntryMutation.isPending,
    },
    getRowId: (waitingListEntry) => waitingListEntry.id,
    renderRowActions: ({ row }) => (
      <Tooltip key={`delete-${row.id}`} label={"Slett"}>
        <ActionIcon
          variant={"subtle"}
          onClick={() => destroyWaitingListEntryMutation.mutate(row.id)}
          color={"red"}
        >
          <IconTrash />
        </ActionIcon>
      </Tooltip>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button onClick={() => table.setCreatingRow(true)}>
        Legg til i venteliste
      </Button>
    ),
    renderCreateRowModalContent: ({ table }) => (
      <CreateWaitingListEntry
        items={items}
        onClose={() => table.setCreatingRow(null)}
      />
    ),
    localization: MRT_Localization_NO,
  });

  return <MantineReactTable table={table} />;
}
