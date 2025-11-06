// MRT does not support React Compiler yet
"use no memo";

import { Button, Group } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
// @ts-expect-error MRT has bad types, hopefully they fix this in the future
import { MRT_Localization_NO } from "mantine-react-table/locales/no";

import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function BranchMembersTable({
  branchId,
  members,
  isLoading,
}: {
  branchId: string;
  members: { id: string; name: string; yearOfBirth: string }[];
  isLoading: boolean;
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const updateBranchMembershipMutation = useMutation({
    mutationFn: async ({
      detailsId,
      branchMembership,
    }: {
      detailsId: string;
      branchMembership: string;
    }) =>
      client.branches.memberships
        .$patch({
          detailsId,
          branchMembership,
        })
        .unwrap(),
    onSuccess: () => showSuccessNotification("Medlemsskapet ble endret!"),
    onError: () => showErrorNotification("Klarte ikke endre medlemsskap!"),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [
          client.v2.branches.memberships({ branchId }).$url(),
          branchId,
        ],
      }),
  });
  const table = useMantineReactTable({
    columns: [
      {
        accessorKey: "name",
        header: "Navn",
      },
      {
        accessorKey: "yearOfBirth",
        header: "Fødselsår",
      },
    ],
    data: members,
    enableEditing: true,
    state: {
      isLoading,
    },
    getRowId: (waitingListEntry) => waitingListEntry.id,
    renderRowActions: function Render({ row }) {
      const form = useAppForm({
        defaultValues: {
          branchMembership: branchId,
        },
        onSubmit: ({ value }) =>
          updateBranchMembershipMutation.mutate({
            detailsId: row.id,
            branchMembership: value.branchMembership,
          }),
      });
      return (
        <Group>
          <form.AppField name={"branchMembership"}>
            {(field) => (
              <field.SelectBranchField perspective={"administrate"} />
            )}
          </form.AppField>
          <Button onClick={form.handleSubmit} bg={"green"}>
            Lagre
          </Button>
        </Group>
      );
    },
    positionActionsColumn: "last",
    localization: MRT_Localization_NO,
  });

  return <MantineReactTable table={table} />;
}
