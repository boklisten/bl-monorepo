"use client";

import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Item } from "@boklisten/backend/shared/item/item";
import { Alert, AlertTitle } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import CreateWaitingListEntry from "@/components/admin/waiting-list/CreateWaitingListEntry";
import WaitingListTable from "@/components/admin/waiting-list/WaitingListTable";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

export default function WaitingList() {
  const client = useApiClient();

  const {
    data: items,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: [client.$url("collection.items.getAll")],
    queryFn: () =>
      client
        .$route("collection.items.getAll")
        .$get()
        .then(unpack<Item[]>),
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
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get({
          query: { active: true, sort: "name" },
        })
        .then(unpack<Branch[]>),
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
