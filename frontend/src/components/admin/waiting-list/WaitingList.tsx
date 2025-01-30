"use client";

import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Item } from "@boklisten/backend/shared/item/item";
import { WaitingListEntry } from "@boklisten/backend/shared/waiting-list/waiting-list-entry";
import { Alert, AlertTitle } from "@mui/material";
import useSWR from "swr";

import BlFetcher from "@/api/blFetcher";
import CreateWaitingListEntry from "@/components/admin/waiting-list/CreateWaitingListEntry";
import WaitingListTable from "@/components/admin/waiting-list/WaitingListTable";
import BL_CONFIG from "@/utils/bl-config";
import { tuyau } from "@/utils/tuyau";

export default function WaitingList() {
  const {
    data: items,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useSWR(`${BL_CONFIG.collection.item}`, BlFetcher.get<Item[]>);

  const {
    data: branches,
    isLoading: isLoadingBranches,
    error: branchesError,
  } = useSWR(
    `${BL_CONFIG.collection.branch}?active=true&sort=name`,
    BlFetcher.get<Branch[]>,
  );

  const {
    data: waitingList,
    isLoading: isLoadingWaitingList,
    error: waitingListError,
    mutate,
  } = useSWR(
    tuyau.waiting_list_entries.$url,
    // fixme: strange SerializedObject type from Tuyau
    () =>
      tuyau.waiting_list_entries
        .$get()
        .unwrap() as unknown as WaitingListEntry[],
  );

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
        mutate={mutate}
        loading={isLoadingItems || isLoadingBranches || isLoadingWaitingList}
      />
      <CreateWaitingListEntry items={items ?? []} mutate={mutate} />
    </>
  );
}
