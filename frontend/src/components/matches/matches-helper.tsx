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

export function calculateFulfilledUserMatchItems(
  userMatch: UserMatchWithDetails,
  isCustomerA: boolean,
): string[] {
  const deliveredBlIds = isCustomerA
    ? userMatch.deliveredBlIdsCustomerA
    : userMatch.deliveredBlIdsCustomerB;
  const receivedBlIds = isCustomerA
    ? userMatch.receivedBlIdsCustomerA
    : userMatch.receivedBlIdsCustomerB;

  const fulfilledItems: string[] = [];
  for (const deliveredBlId of deliveredBlIds) {
    const deliveredItem = userMatch.blIdToItemMap[deliveredBlId];
    if (deliveredItem) {
      fulfilledItems.push(deliveredItem);
    }
  }
  for (const receivedBlId of receivedBlIds) {
    const receivedItem = userMatch.blIdToItemMap[receivedBlId];
    if (receivedItem) {
      fulfilledItems.push(receivedItem);
    }
  }
  // It should not be possible to have duplicates here, but better to be certain than sorry
  return Array.from(new Set(fulfilledItems));
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

/**
 * Checks if all expected items in a match are fulfilled.
 *
 * @param userMatch
 * @param isCustomerA
 */
export function isUserMatchFulfilled(
  userMatch: UserMatchWithDetails,
  isCustomerA: boolean,
): boolean {
  return (
    calculateFulfilledUserMatchItems(userMatch, isCustomerA).length >=
    userMatch.expectedAToBItems.length + userMatch.expectedBToAItems.length
  );
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
