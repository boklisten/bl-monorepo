import {
  StandMatchWithDetails,
  UserMatchWithDetails,
} from "@frontend/utils/types";
import { Typography } from "@mui/material";
import { Match, MatchVariant } from "@shared/match/match";
import { MatchWithDetails } from "@shared/match/match-dtos";
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
  match: StandMatchWithDetails,
): {
  fulfilledHandoffItems: string[];
  fulfilledPickupItems: string[];
} {
  const fulfilledHandoffItems = match.expectedHandoffItems.filter((item) =>
    match.deliveredItems.includes(item),
  );
  const fulfilledPickupItems = match.expectedPickupItems.filter((item) =>
    match.receivedItems.includes(item),
  );
  return { fulfilledHandoffItems, fulfilledPickupItems };
}

export function calculateFulfilledUserMatchItems(
  match: UserMatchWithDetails,
  isSender: boolean,
): string[] {
  return match.expectedItems.filter((item) =>
    // For a sender, an item must have been both delivered and received to be fulfilled, though
    // it does not need to be the same blId; someone else can deliver your book, and you can
    // deliver someone else's, and that's fine.
    // For the receiver, we only care that the book is received.
    (isSender
      ? [match.deliveredBlIds, match.receivedBlIds]
      : [match.receivedBlIds]
    ).every((registeredBlIds) =>
      registeredBlIds.some((blId) => match.blIdToItemMap[blId] === item),
    ),
  );
}

export function calculateItemStatuses<T extends MatchWithDetails>(
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
 * @param match
 * @param isSender Whether the user to check whether has fulfilled the match is the sender.
 * Ignored for StandMatch.
 */
export function isMatchFulfilled(
  match: MatchWithDetails,
  isSender: boolean,
): boolean {
  if (match._variant === MatchVariant.StandMatch) {
    const { fulfilledHandoffItems, fulfilledPickupItems } =
      calculateFulfilledStandMatchItems(match);
    return (
      fulfilledHandoffItems.length >= match.expectedHandoffItems.length &&
      fulfilledPickupItems.length >= match.expectedPickupItems.length
    );
  } else {
    return (
      calculateFulfilledUserMatchItems(match, isSender).length >=
      match.expectedItems.length
    );
  }
}

/**
 * Check if any expected items in a match are fulfilled.
 *
 * @param match
 * @param isSender Whether the user to check whether has fulfilled the match is the sender.
 * Ignored for StandMatch.
 */
export function isMatchBegun(
  match: MatchWithDetails,
  isSender: boolean,
): boolean {
  if (match._variant === MatchVariant.StandMatch) {
    const { fulfilledHandoffItems, fulfilledPickupItems } =
      calculateFulfilledStandMatchItems(match);
    return fulfilledHandoffItems.length > 0 || fulfilledPickupItems.length > 0;
  } else {
    return calculateFulfilledUserMatchItems(match, isSender).length > 0;
  }
}

/**
 * Check whether the user is the sender in the match.
 *
 * Returns whatever if match is a StandMatch.
 * @param match
 * @param currentUserId
 */
export function isUserSenderInMatch(
  match: Match,
  currentUserId: string,
): boolean {
  if (match._variant === MatchVariant.UserMatch) {
    return match.sender === currentUserId;
  }
  return false;
}
