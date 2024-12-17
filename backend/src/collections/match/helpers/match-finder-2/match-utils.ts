import {
  MatchableUser,
  CandidateMatch,
  CandidateMatchVariant,
} from "@/collections/match/helpers/match-finder-2/match-types";
import {
  difference,
  hasDifference,
  intersect,
} from "@/collections/match/helpers/set-methods";

/**
 * Create a sorted deep copy of the input users
 * @param users
 */
export function copyUsers(users: MatchableUser[]): MatchableUser[] {
  return users.map((user) => ({
    id: user.id,
    items: new Set(user.items),
  }));
}

/**
 * Sort users in place, by descending number of items
 * @param users
 */
export function sortUsersNumberOfItemsDescending(users: MatchableUser[]) {
  users.sort((a, b) => (a.items.size > b.items.size ? -1 : 1));
}

/**
 * Some guuuuud sorting. This works. Trust me. No idea why.
 * @param users
 * @param matches
 */
export function sortUsersForPartialMatching(
  users: MatchableUser[],
  matches: CandidateMatch[],
) {
  const hasStandMatch = (user: MatchableUser) =>
    matches.some(
      (match) =>
        match.variant === CandidateMatchVariant.StandMatch &&
        match.userId === user.id,
    );

  users.sort((a, b) => {
    const aHasStandMatch = hasStandMatch(a);
    const bHasStandMatch = hasStandMatch(b);
    if (aHasStandMatch && !bHasStandMatch) {
      return -1;
    }

    if (!aHasStandMatch && !bHasStandMatch) {
      return 0;
    }

    return a.items.size > b.items.size ? 1 : -1;
  });
}

/**
 * Groups users by their number of items, descending.
 * For instance, if the highest number of items any users has is N, the outer list contains N+1 lists, where outer[0] is
 * the list of users with N items, outer[1] is the list of users with N-1 items, etc. all the way to outer[N], the list
 * of users with zero items.
 * The order of users within the inner lists is arbitrary.
 * @param users
 */
export function groupUsersByNumberOfItems(
  users: MatchableUser[],
): MatchableUser[][] {
  const maxNumberOfItems = users.reduce(
    (currentMax, nextUser) => Math.max(currentMax, nextUser.items.size),
    0,
  );

  const sortedUserGroups: MatchableUser[][] = [
    ...Array(maxNumberOfItems + 1),
  ].map(() => []);

  for (const user of users) {
    if (user.items.size > 0) {
      const userGroup = sortedUserGroups[user.items.size];
      if (userGroup === undefined) {
        throw new Error(
          "SortedSenderGroups should have as many entries as the maximum number of sender items",
        );
      }
      userGroup.push(user);
    }
  }

  return sortedUserGroups.reverse();
}

/**
 * Removes fully matched users, aka. users that have no items
 *
 * @param users the set of users to be cleaned
 * @returns a shallow copy of the users list without the fully matched users
 */
export function removeFullyMatchedUsers(
  users: MatchableUser[],
): MatchableUser[] {
  return users.filter((user) => user.items.size > 0);
}

/**
 * Try to find a receiver that has the same items as the sender,
 * so that the sender gets rid of all his books. The receiver
 * should have as few extra items as possible, to make him easy to match later.
 * @param sender The sender to be matched
 * @param receivers The receivers to match against
 */
export function tryFindOneWayMatch(
  sender: MatchableUser,
  receivers: MatchableUser[],
): MatchableUser | null {
  return receivers.reduce((best: MatchableUser | null, next) => {
    return sender.id !== next.id &&
      !hasDifference(sender.items, next.items) &&
      (best === null || next.items.size < best.items.size)
      ? next
      : best;
  }, null);
}

/**
 * Try to find a receiver that has the exact same items
 * as the sender. These two are "perfect matches", as they
 * only have to interact with one person when matching.
 * @param sender The sender to be matched
 * @param receivers The receivers to match against
 */
export function tryFindTwoWayMatch(
  sender: MatchableUser,
  receivers: MatchableUser[],
): MatchableUser | null {
  return (
    receivers.find(
      (receiver) =>
        sender.id !== receiver.id &&
        !hasDifference(sender.items, receiver.items) &&
        !hasDifference(receiver.items, sender.items),
    ) ?? null
  );
}

/**
 * Try to find a receiver that wants as many items as possible from the sender
 * @param sender The sender to be matched
 * @param receivers The receivers to match against
 * @returns the receiver with maximum number of matching items, or null if none match
 */
export function tryFindPartialMatch(
  sender: MatchableUser,
  receivers: MatchableUser[],
): MatchableUser | null {
  let bestReceiver: MatchableUser | null = null;
  for (const receiver of receivers) {
    if (sender.id === receiver.id) {
      continue;
    }
    const matchableItems = intersect(sender.items, receiver.items);
    const bestMatchableItems = intersect(
      sender.items,
      bestReceiver?.items ?? new Set(),
    );

    if (matchableItems.size > bestMatchableItems.size) {
      // If the match only lacks one item, it is the best case
      if (bestMatchableItems.size >= sender.items.size - 1) {
        return receiver;
      }

      bestReceiver = receiver;
    }
  }

  return bestReceiver;
}

/**
 * Count occurrences of each item in users list
 * @param users
 */
export function countItemOccurrences(
  users: MatchableUser[],
): Record<string, number> {
  return users
    .flatMap((user) => Array.from(user.items))
    .reduce(
      (acc: Record<string, number>, next) => ({
        ...acc,
        [next]: acc[next] ? acc[next] + 1 : 1,
      }),
      {},
    );
}

/**
 *
 * For each item, calculate the number to be sent minus number to be received.
 * @param groupedSenderItems - The grouped items of the senders.
 * @param groupedReceiverItems - The grouped items of the receivers.
 * @returns An object where the keys are the items and the values are the differences between number of that item given
 * by senders and wanted by receivers.
 * @private
 */
export function calculateItemImbalances(
  groupedSenderItems: Record<string, number>,
  groupedReceiverItems: Record<string, number>,
): Record<string, number> {
  return Object.keys({ ...groupedReceiverItems, ...groupedSenderItems }).reduce(
    (diffs, item) => {
      const senderItemCount = groupedSenderItems[item] ?? 0;
      const receiverItemCount = groupedReceiverItems[item] ?? 0;

      return {
        ...diffs,
        [item]: senderItemCount - receiverItemCount,
      };
    },
    {},
  );
}

/**
 * Checks if a full stand match can be made for a user
 * so that they are fulfilled
 * @param user - The user to check
 * @param itemImbalances - The imbalances in item counts
 * @param userIsSender - Whether the user is a sender or receiver
 * @returns True if a full stand match can be made, false otherwise
 * @private
 *
 **/
export function canMatchPerfectlyWithStand(
  user: MatchableUser,
  itemImbalances: Record<string, number>,
  userIsSender: boolean,
): boolean {
  return Array.from(user.items).every((item) => {
    return userIsSender
      ? (itemImbalances[item] ?? 0) > 0
      : (itemImbalances[item] ?? 0) < 0;
  });
}

/**
 * Updates the imbalance count for each item of a user after the given match
 * @param items - The items to update the difference for
 * @param itemImbalances - The imbalances in item counts
 * @param userIsSender - Whether the user is a sender or receiver
 * @private
 */
export function updateItemImbalances(
  items: Set<string>,
  itemImbalances: Record<string, number>,
  userIsSender: boolean,
): void {
  const modifier = userIsSender ? -1 : 1;

  for (const item of items) {
    itemImbalances[item] = (itemImbalances[item] ?? 0) + modifier;
  }
}

/**
 * Calculate which items have no overlap between sender and receivers.
 * Aka. either no one wants the items, or no one has the items
 * @param senders
 * @param receivers
 */
export function calculateUnmatchableItems(
  senders: MatchableUser[],
  receivers: MatchableUser[],
): {
  unmatchableSenderItems: Set<string>;
  unmatchableReceiverItems: Set<string>;
} {
  const requiredSenderItems = new Set(
    senders.flatMap((user) => [...user.items]),
  );
  const requiredReceiverItems = new Set(
    receivers.flatMap((user) => [...user.items]),
  );
  const unmatchableSenderItems = difference(
    requiredSenderItems,
    requiredReceiverItems,
  );
  const unmatchableReceiverItems = difference(
    requiredReceiverItems,
    requiredSenderItems,
  );

  return { unmatchableSenderItems, unmatchableReceiverItems };
}
