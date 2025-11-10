import { Button, Group, Skeleton, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconBuildingStore,
  IconHierarchy3,
  IconUsers,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity } from "react";

import BranchMembersTable from "@/features/branches/BranchMembersTable";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function BranchMembers({ branchId }: { branchId: string }) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: [client.v2.branches.memberships({ branchId }).$url(), branchId],
    queryFn: () => client.v2.branches.memberships({ branchId }).$get().unwrap(),
  });

  const removeMembersMutation = useMutation({
    mutationFn: ({
      branchId,
      scope,
    }: {
      branchId: string;
      scope: "direct" | "indirect";
    }) =>
      scope === "direct"
        ? client.branches.memberships.direct({ branchId }).$delete()
        : client.branches.memberships.indirect({ branchId }).$delete(),
    onSuccess: () => showSuccessNotification("Medlemsliste ble oppdatert"),
    onError: () => showErrorNotification("Klarte ikke oppdatere medlemsliste"),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [
          client.v2.branches.memberships({ branchId }).$url(),
          branchId,
        ],
      }),
  });
  return (
    <>
      <Group gap={5}>
        <IconUsers />
        <Text fw={"bold"}>Totalt:</Text>
        <Activity mode={isLoading ? "visible" : "hidden"}>
          <Skeleton w={"xl"} h={"md"} />
        </Activity>
        <Activity mode={data ? "visible" : "hidden"}>
          <Text>
            {(data?.directMembers.length ?? 0) +
              (data?.indirectMembers.count ?? 0)}
          </Text>
        </Activity>
      </Group>
      <Group gap={5}>
        <IconBuildingStore />
        <Text fw={"bold"}>Denne filialen:</Text>
        <Activity mode={isLoading ? "visible" : "hidden"}>
          <Skeleton w={"xl"} h={"md"} />
        </Activity>
        <Activity mode={data ? "visible" : "hidden"}>
          <Text>{data?.directMembers.length}</Text>
        </Activity>
        <Activity
          mode={(data?.directMembers.length ?? 0) > 0 ? "visible" : "hidden"}
        >
          <Button
            variant={"subtle"}
            c={"red"}
            loading={removeMembersMutation.isPending}
            onClick={() =>
              modals.openConfirmModal({
                title: "Bekreft sletting av medlemsskap",
                children:
                  "Du er i ferd med å slette medlemsskapene til denne filialen. Dette kan ikke angres.",
                labels: { cancel: "Avbryt", confirm: "Bekreft" },
                onConfirm: () =>
                  removeMembersMutation.mutate({ branchId, scope: "direct" }),
              })
            }
          >
            Fjern medlemmer
          </Button>
        </Activity>
      </Group>
      <Group gap={5}>
        <IconHierarchy3 />
        <Text fw={"bold"}>Underliggende filialer:</Text>
        <Activity mode={isLoading ? "visible" : "hidden"}>
          <Skeleton w={"xl"} h={"md"} />
        </Activity>
        <Activity mode={data ? "visible" : "hidden"}>
          <Text>{data?.indirectMembers.count}</Text>
        </Activity>
        <Activity
          mode={(data?.indirectMembers.count ?? 0) > 0 ? "visible" : "hidden"}
        >
          <Button
            variant={"subtle"}
            c={"red"}
            loading={removeMembersMutation.isPending}
            onClick={() =>
              modals.openConfirmModal({
                title: "Bekreft sletting av medlemsskap",
                children:
                  "Du er i ferd med å slette medlemsskapene til denne filialens underfilialer. Dette kan ikke angres.",
                labels: { cancel: "Avbryt", confirm: "Bekreft" },
                onConfirm: () =>
                  removeMembersMutation.mutate({ branchId, scope: "indirect" }),
              })
            }
          >
            Fjern medlemmer
          </Button>
        </Activity>
      </Group>
      <Title order={3}>Medlemmer av denne filialen</Title>
      <BranchMembersTable
        branchId={branchId}
        members={data?.directMembers ?? []}
        isLoading={isLoading}
      />
    </>
  );
}
