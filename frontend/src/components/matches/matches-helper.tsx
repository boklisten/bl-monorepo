import { Typography } from "@mui/material";
import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@shared/match/match-dtos";
import { ReactNode } from "react";

export interface ItemStatus {
  id: string;
  title: string;
  fulfilled: boolean;
}

export const MatchHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Typography variant="h2" sx={{ marginTop: 4, marginBottom: 2 }}>
      {children}
    </Typography>
  );
};

export function calculateFulfilledStandMatchItems(
  standMatch: StandMatchWithDetails,
): {
  fulfilledHandoffItems: string[];
  fulfilledPickupItems: string[];
} {
  const fulfilledHandoffItems = standMatch.expectedHandoffItems.filter((item) =>
    standMatch.deliveredItems.includes(item),
  );
  const fulfilledPickupItems = standMatch.expectedPickupItems.filter((item) =>
    standMatch.receivedItems.includes(item),
  );
  return { fulfilledHandoffItems, fulfilledPickupItems };
}

export interface UserMatchStatus {
  currentUser: {
    items: string[];
    wantedItems: string[];
    deliveredItems: string[];
    receivedItems: string[];
    name: string;
  };
  otherUser: {
    items: string[];
    wantedItems: string[];
    deliveredItems: string[];
    receivedItems: string[];
    name: string;
  };
}

export function calculateUserMatchStatus(
  userMatch: UserMatchWithDetails,
  currentUserId: string,
): UserMatchStatus {
  const customerA = {
    deliveredItems: [] as string[],
    receivedItems: [] as string[],
  };
  for (const deliveredBlId of userMatch.deliveredBlIdsCustomerA) {
    const deliveredItem = userMatch.blIdToItemMap[deliveredBlId];
    if (deliveredItem) {
      customerA.deliveredItems.push(deliveredItem);
    }
  }
  for (const receivedBlId of userMatch.receivedBlIdsCustomerA) {
    const receivedItem = userMatch.blIdToItemMap[receivedBlId];
    if (receivedItem) {
      customerA.receivedItems.push(receivedItem);
    }
  }

  const customerB = {
    deliveredItems: [] as string[],
    receivedItems: [] as string[],
  };
  for (const deliveredBlId of userMatch.deliveredBlIdsCustomerB) {
    const deliveredItem = userMatch.blIdToItemMap[deliveredBlId];
    if (deliveredItem) {
      customerB.deliveredItems.push(deliveredItem);
    }
  }
  for (const receivedBlId of userMatch.receivedBlIdsCustomerB) {
    const receivedItem = userMatch.blIdToItemMap[receivedBlId];
    if (receivedItem) {
      customerB.receivedItems.push(receivedItem);
    }
  }
  const currentUserIsCustomerA = userMatch.customerA === currentUserId;
  return {
    currentUser: {
      items: currentUserIsCustomerA
        ? userMatch.expectedAToBItems
        : userMatch.expectedBToAItems,
      wantedItems: currentUserIsCustomerA
        ? userMatch.expectedBToAItems
        : userMatch.expectedAToBItems,
      deliveredItems: currentUserIsCustomerA
        ? customerA.deliveredItems
        : customerB.deliveredItems,
      receivedItems: currentUserIsCustomerA
        ? customerA.receivedItems
        : customerB.receivedItems,
      name: currentUserIsCustomerA
        ? userMatch.customerADetails.name
        : userMatch.customerBDetails.name,
    },
    otherUser: {
      items: currentUserIsCustomerA
        ? userMatch.expectedBToAItems
        : userMatch.expectedAToBItems,
      wantedItems: currentUserIsCustomerA
        ? userMatch.expectedAToBItems
        : userMatch.expectedBToAItems,
      deliveredItems: currentUserIsCustomerA
        ? customerB.deliveredItems
        : customerA.deliveredItems,
      receivedItems: currentUserIsCustomerA
        ? customerB.receivedItems
        : customerA.receivedItems,
      name: currentUserIsCustomerA
        ? userMatch.customerBDetails.name
        : userMatch.customerADetails.name,
    },
  };
}

export function calculateItemStatuses<
  T extends UserMatchWithDetails | StandMatchWithDetails,
>(
  match: T,
  expectedItemsSelector: (match: T) => string[],
  fulfilledItems: string[],
): ItemStatus[] {
  return expectedItemsSelector(match)
    .map((id) => {
      const details = match.itemDetails[id];
      if (!details) {
        throw new Error(`Fant ikke detaljer for bok ${id}`);
      }
      return details;
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      fulfilled: fulfilledItems.includes(item.id),
    }));
}

export function isStandMatchFulfilled(
  standMatch: StandMatchWithDetails | undefined,
) {
  if (!standMatch) return false;

  const { fulfilledHandoffItems, fulfilledPickupItems } =
    calculateFulfilledStandMatchItems(standMatch);
  return (
    fulfilledHandoffItems.length >= standMatch.expectedHandoffItems.length &&
    fulfilledPickupItems.length >= standMatch.expectedPickupItems.length
  );
}

/**
 * Check if any expected items in a stand match are fulfilled.
 *
 * @param standMatch
 */
export function isStandMatchBegun(standMatch: StandMatchWithDetails): boolean {
  const { fulfilledHandoffItems, fulfilledPickupItems } =
    calculateFulfilledStandMatchItems(standMatch);
  return fulfilledHandoffItems.length > 0 || fulfilledPickupItems.length > 0;
}
