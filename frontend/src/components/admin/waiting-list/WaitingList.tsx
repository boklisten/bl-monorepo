"use client";

import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Item } from "@boklisten/backend/shared/item/item";
import { Alert, AlertTitle } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import BlFetcher from "@/api/blFetcher";
import CreateWaitingListEntry from "@/components/admin/waiting-list/CreateWaitingListEntry";
import WaitingListTable from "@/components/admin/waiting-list/WaitingListTable";
import useApiClient from "@/utils/api/useApiClient";

export default function WaitingList() {
  const client = useApiClient();

  const {
    data: items,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: [client.$url("collection.items.getAll")],
    queryFn: ({ queryKey }) => BlFetcher.get<Item[]>(queryKey[0] ?? ""),
  });

  const {
    data: branches,
    isLoading: isLoadingBranches,
    error: branchesError,
  } = useQuery({
    queryKey: [
      client.$url("collection.branches.getAll", {
        query: { active: true, sort: "name" },
      }),
    ],
    queryFn: ({ queryKey }) => BlFetcher.get<Branch[]>(queryKey[0] ?? ""),
  });

  const {
    data: waitingList,
    isLoading: isLoadingWaitingList,
    error: waitingListError,
  } = useQuery({
    queryKey: [client.waiting_list_entries.$url()],
    queryFn: () => client.waiting_list_entries.$get().unwrap(),
  });

  if (itemsError || branchesError || waitingListError) {
    return (
      <Alert severity="error">
        <AlertTitle>Klarte ikke laste inn venteliste</AlertTitle>
        Du kan prøve igjen, eller ta kontakt dersom problemet vedvarer.
      </Alert>
    );
  }

  return (
    <>
      <WaitingListTable
        items={items ?? []}
        branches={branches ?? []}
        waitingList={waitingList ?? []}
        loading={isLoadingItems || isLoadingBranches || isLoadingWaitingList}
      />
      <CreateWaitingListEntry items={items ?? []} />
    </>
  );
}
