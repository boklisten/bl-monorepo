import { Group, Skeleton, Text, Title } from "@mantine/core";
import {
  IconBuildingStore,
  IconHierarchy3,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "react";

import BranchMembersTable from "@/features/branches/BranchMembersTable";
import useApiClient from "@/shared/hooks/useApiClient";

export default function BranchMembers({ branchId }: { branchId: string }) {
  const client = useApiClient();
  const { data, isLoading } = useQuery({
    queryKey: [client.v2.branches.memberships({ branchId }).$url(), branchId],
    queryFn: () => client.v2.branches.memberships({ branchId }).$get().unwrap(),
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
