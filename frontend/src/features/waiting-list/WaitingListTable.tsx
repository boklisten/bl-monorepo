// MRT does not support React Compiler yet
"use no memo";

import type { Branch } from "@boklisten/backend/shared/branch";
import type { Item } from "@boklisten/backend/shared/item";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
// @ts-expect-error MRT has bad types, hopefully they fix this in the future
import { MRT_Localization_NO } from "mantine-react-table/locales/no";

import CreateWaitingListEntry from "@/features/waiting-list/CreateWaitingListEntry";
import useApiClient from "@/shared/hooks/useApiClient";
import { showErrorNotification, showSuccessNotification } from "@/shared/utils/notifications";
import { Route } from "@tuyau/core/types";

export default function WaitingListTable({
  loading,
  items,
  branches,
  waitingList,
}: {
  loading: boolean;
  items: Item[];
  branches: Branch[];
  waitingList: Route.Response<"waiting_list_customer.get_all">;
}) {
  const { api } = useApiClient();
  const queryClient = useQueryClient();

  const destroyWaitingListEntryMutation = useMutation(
    api.waitingListCustomer.destroy.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: api.waitingListCustomer.getAll.pathKey(),
        }),
      onSuccess: () => showSuccessNotification("Ventelisteoppføring ble slettet!"),
      onError: async () => showErrorNotification("Klarte ikke slette ventelisteoppføring!"),
    }),
  );

  const table = useMantineReactTable({
    columns: [
      {
        accessorKey: "name",
        header: "Navn",
      },
      {
        accessorKey: "phoneNumber",
        header: "Telefonnummer",
      },
      {
        accessorFn: (waitingListEntry) =>
          items.find((item) => item.id === waitingListEntry.itemId)?.title,
        header: "Bok",
      },
      {
        accessorFn: (waitingListEntry) =>
          branches.find((branch) => branch.id === waitingListEntry.branchId)?.name,
        header: "Filial",
      },
    ],
    data: waitingList,
    enableEditing: true,
    state: {
      isLoading: loading || destroyWaitingListEntryMutation.isPending,
    },
    getRowId: (waitingListCustomer) => waitingListCustomer.id,
    renderRowActions: ({ row }) => (
      <Tooltip key={`delete-${row.id}`} label={"Slett"}>
        <ActionIcon
          variant={"subtle"}
          onClick={() => destroyWaitingListEntryMutation.mutate({ params: { id: row.id } })}
          color={"red"}
        >
          <IconTrash />
        </ActionIcon>
      </Tooltip>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button onClick={() => table.setCreatingRow(true)}>Legg til i venteliste</Button>
    ),
    renderCreateRowModalContent: ({ table }) => (
      <CreateWaitingListEntry items={items} onClose={() => table.setCreatingRow(null)} />
    ),
    localization: MRT_Localization_NO,
  });

  return <MantineReactTable table={table} />;
}
