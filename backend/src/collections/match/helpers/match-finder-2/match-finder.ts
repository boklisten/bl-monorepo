import {
  MatchableUser,
  CandidateMatch,
  CandidateStandMatch,
  CandidateMatchVariant,
} from "@backend/collections/match/helpers/match-finder-2/match-types";
import {
  calculateItemImbalances,
  calculateUnmatchableItems,
  canMatchPerfectlyWithStand,
  copyUsers,
  countItemOccurrences,
  groupUsersByNumberOfItems,
  removeFullyMatchedUsers,
  sortUsersForPartialMatching,
  sortUsersNumberOfItemsDescending,
  tryFindOneWayMatch,
  tryFindPartialMatch,
  tryFindTwoWayMatch,
  updateItemImbalances,
} from "@backend/collections/match/helpers/match-finder-2/match-utils";
import {
  difference,
  hasDifference,
  intersect,
  union,
} from "@backend/collections/match/helpers/set-methods";
import { BlError } from "@shared/bl-error/bl-error";

export class MatchFinder {
  public senders: MatchableUser[];
  public receivers: MatchableUser[];
  public unmatchableItems = new Set<string>();

  private matches: CandidateMatch[] = [];
  private readonly MAX_USER_MATCH_COUNT = 2;

  constructor(
    private _senders: MatchableUser[],
    private _receivers: MatchableUser[],
  ) {
    this.receivers = copyUsers(_receivers);
    this.senders = copyUsers(_senders);
  }

  /**
   * Trigger generation of matches
   * @returns an optimal matching of the given senders and receivers
   */
  public generateMatches() {
    // First remove the perfect matches
    this.createMatches(tryFindTwoWayMatch, this.senders);

    // Fulfill the largest possible senders with the best receivers
    sortUsersNumberOfItemsDescending(this.senders);
    sortUsersNumberOfItemsDescending(this.receivers);
    this.createMatches(tryFindOneWayMatch, this.senders);

    // Remove all unmatchable items
    this.standMatchUnmatchableItems();
    // We might have opened up for some TwoWay matches after purging the unmatchable items
    this.createMatches(tryFindTwoWayMatch, this.senders);
    // Edge case, but removing TwoWay matches might make some more items unmatchable
    this.standMatchUnmatchableItems();

    // Fully match the largest possible senders and receivers with the stand
    sortUsersNumberOfItemsDescending(this.senders);
    sortUsersNumberOfItemsDescending(this.receivers);
    this.createFullStandMatches();

    // In testing with large datasets, doing this sorting
    // provided much better results for partial matching
    sortUsersForPartialMatching(this.senders, this.matches);
    sortUsersForPartialMatching(this.receivers, this.matches);
    const sortedSenderGroups = groupUsersByNumberOfItems(this.senders);

    for (const sortedSenderGroup of sortedSenderGroups) {
      this.createMatches(
        tryFindPartialMatch,
        sortedSenderGroup,
        sortedSenderGroups,
      );
    }

    // Create stand pickups for the remainder of the items
    for (const receiver of this.receivers) {
      this.createStandMatch(receiver, receiver.items, false);
    }
    this.verifyMatches();

    return this.matches;
  }

  /**
   * Verify that all senders and receivers have matches for all their items.
   */
  private verifyMatches() {
    this.senders = removeFullyMatchedUsers(this.senders);
    this.receivers = removeFullyMatchedUsers(this.receivers);

    if (this.senders.length > 0 || this.receivers.length > 0) {
      throw new BlError("Some senders or receivers did not receive a match!");
    }

    let originalSenders = copyUsers(this._senders);
    let originalReceivers = copyUsers(this._receivers);

    for (const match of this.matches) {
      const senderId =
        match.variant === CandidateMatchVariant.StandMatch
          ? match.userId
          : match.senderId;
      const sentItems =
        match.variant === CandidateMatchVariant.StandMatch
          ? match.handoffItems
          : match.items;
      const sender = originalSenders.find((sender) => sender.id === senderId);
      if (sender) {
        if (hasDifference(intersect(sentItems, sender.items), sentItems)) {
          throw new BlError(
            "Sender cannot give away more books than they have!",
          );
        }
        sender.items = difference(sender.items, sentItems);
        originalSenders = removeFullyMatchedUsers(originalSenders);
      }

      const receiverId =
        match.variant === CandidateMatchVariant.StandMatch
          ? match.userId
          : match.receiverId;
      const receivedItems =
        match.variant === CandidateMatchVariant.StandMatch
          ? match.pickupItems
          : match.items;
      const receiver = originalReceivers.find(
        (receiver) => receiver.id === receiverId,
      );
      if (receiver) {
        if (
          hasDifference(intersect(receivedItems, receiver.items), receivedItems)
        ) {
          throw new BlError(
            "Receiver cannot receive more books than they want!",
          );
        }
        receiver.items = difference(receiver.items, receivedItems);
        originalReceivers = removeFullyMatchedUsers(originalReceivers);
      }

      if (
        match.variant === CandidateMatchVariant.UserMatch &&
        senderId === receiverId
      ) {
        throw new BlError("Receiver and sender cannot be the same person");
      }
    }

    if (originalSenders.length > 0 || originalReceivers.length > 0) {
      throw new BlError("Some senders or receivers did not get fulfilled");
    }
  }

  /**
   * Identifies items that cannot be matched
   * (no one wants them, or no one has them) and creates stand matches for them.
   * For each sender, a StandDeliveryMatch is created for the unmatchable sender items.
   * For each receiver, a StandPickupMatch is created for the unmatchable receiver items.
   * @private
   */
  private standMatchUnmatchableItems() {
    const { unmatchableSenderItems, unmatchableReceiverItems } =
      calculateUnmatchableItems(this.senders, this.receivers);
    this.unmatchableItems = unmatchableSenderItems;

    for (const sender of this.senders) {
      this.createStandMatch(sender, this.unmatchableItems, true);
    }

    for (const receiver of this.receivers) {
      this.createStandMatch(receiver, unmatchableReceiverItems, false);
    }
  }

  /**
   * Creates initial stand matches for senders and receivers
   * This method groups sender and receiver items by count and calculates the imbalance between them
   * After that, it checks if a full stand match can be made for each sender and receiver
   * If a full stand match can be made, it updates the difference and creates a stand match
   * @private
   */
  private createFullStandMatches() {
    const senderItems = countItemOccurrences(this.senders);
    const receiverItems = countItemOccurrences(this.receivers);
    const itemImbalances = calculateItemImbalances(senderItems, receiverItems);

    this.createImbalanceMinimizingMatches(this.senders, itemImbalances, true);
    this.createImbalanceMinimizingMatches(
      this.receivers,
      itemImbalances,
      false,
    );
  }

  /**
   * Creates stand matches for a list of users
   * This method checks if a full stand match can be made for each user
   * If a full stand match can be made, it updates the difference in counts and creates a stand match
   * @param users - The users for whom to create matches
   * @param itemImbalances - An object where the keys are the items and the values are the differences between number of that item given
   * * by senders and wanted by receivers.
   * @param userIsSender - Whether the user is a sender or receiver
   * @private
   */
  private createImbalanceMinimizingMatches(
    users: MatchableUser[],
    itemImbalances: Record<string, number>,
    userIsSender: boolean,
  ) {
    for (const user of users) {
      if (canMatchPerfectlyWithStand(user, itemImbalances, userIsSender)) {
        updateItemImbalances(user.items, itemImbalances, userIsSender);
        this.createStandMatch(user, user.items, userIsSender);
      }
    }
  }

  /**
   * This method checks if a user has reached the maximum limit for UserMatches,
   * and if so, creates a stand match for the user. The type of the stand match (pickup or delivery)
   * depends on the provided standMatchType parameter.
   *
   * @param user - The user (either a sender or receiver) for whom the stand match may be created.
   *
   * @param userIsSender - Whether the user is a sender or receiver
   *
   * @private
   */
  private createStandMatchIfReachedMatchLimit(
    user: MatchableUser,
    userIsSender: boolean,
  ) {
    const matchTypeId = userIsSender ? "senderId" : "receiverId";
    let count = 0;

    const isLimited = this.matches.some((match) => {
      if (
        match.variant === CandidateMatchVariant.UserMatch &&
        match[matchTypeId] === user.id
      ) {
        count++;
      }
      return count >= this.MAX_USER_MATCH_COUNT;
    });

    if (isLimited) {
      this.createStandMatch(user, user.items, userIsSender);
    }
  }

  /**
   * Create matches for senders fround from a given matchFinder function
   * Create delivery matches for unmatchable items
   * @param matchFinder a function that finds a match for a given sender
   * @param senders the senders to be matched
   * @param sortedSenderGroups sender groups required for partial matching
   * @private
   */
  private createMatches(
    matchFinder: (
      sender: MatchableUser,
      receivers: MatchableUser[],
    ) => MatchableUser | null,
    senders: MatchableUser[],
    sortedSenderGroups?: MatchableUser[][],
  ) {
    for (const sender of senders) {
      // Match unmatchable items with stand
      this.createStandMatch(sender, this.unmatchableItems, true);

      // If all items are unmatchable, the sender is fully matched
      if (sender.items.size === 0) {
        continue;
      }

      const receiver = matchFinder(sender, this.receivers);

      if (receiver === null) {
        if (matchFinder === tryFindPartialMatch) {
          // If there is no partial receiver, no one wants any of these items.
          // Thus, the items should be delivered to a stand and marked unmatchable
          this.unmatchableItems = union(this.unmatchableItems, sender.items);
          this.createStandMatch(sender, this.unmatchableItems, true);
        }
        continue;
      }

      this.createUserMatch(sender, receiver);

      this.createStandMatchIfReachedMatchLimit(sender, true);
      this.createStandMatchIfReachedMatchLimit(receiver, false);

      // Add the partially matched sender to a new group, so that the remainder of the items can get matched later
      if (matchFinder === tryFindPartialMatch && sender.items.size > 0) {
        // Needs to be placed in front of the set, so that it is prioritized when matching that group
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const groupIndex = sortedSenderGroups.length - 1 - sender.items.size;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sortedSenderGroups[groupIndex] = [
          sender, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...sortedSenderGroups[groupIndex],
        ];
      }
    }

    // Cleanup senders and receivers
    this.senders = removeFullyMatchedUsers(this.senders);
    this.receivers = removeFullyMatchedUsers(this.receivers);
  }

  /**
   * Match all overlapping items between a sender and a receiver,
   * and remove their matched items.
   * @param sender - User sending items.
   * @param receiver - User receiving items.
   * @private
   */
  private createUserMatch(sender: MatchableUser, receiver: MatchableUser) {
    const matchableItems = intersect(sender.items, receiver.items);
    this.matches.push({
      senderId: sender.id,
      receiverId: receiver.id,
      items: matchableItems,
      variant: CandidateMatchVariant.UserMatch,
    });

    receiver.items = difference(receiver.items, matchableItems);
    sender.items = difference(sender.items, matchableItems);
  }

  /**
   * Match all specified items with the stand,
   * as either a delivery or pickup match,
   * and append the match to the list of matches
   * @param user
   * @param items the items to be picked up
   * @param userIsSender - Whether the user is a sender or receiver
   * @private
   */
  private createStandMatch(
    user: MatchableUser,
    items: Set<string>,
    userIsSender: boolean,
  ) {
    const remainingItems = intersect(user.items, items);
    if (remainingItems.size === 0) {
      return;
    }

    const existingMatch = this.matches.find(
      (match) =>
        match.variant === CandidateMatchVariant.StandMatch &&
        (match as CandidateStandMatch).userId === user.id,
    ) as CandidateStandMatch | undefined;

    if (existingMatch) {
      if (userIsSender) {
        existingMatch.handoffItems = union(
          existingMatch.handoffItems,
          remainingItems,
        );
      } else {
        existingMatch.pickupItems = union(
          existingMatch.pickupItems,
          remainingItems,
        );
      }
      user.items = difference(user.items, remainingItems);
      return;
    }

    const match: CandidateStandMatch = {
      handoffItems: userIsSender ? remainingItems : new Set(),
      pickupItems: userIsSender ? new Set() : remainingItems,
      userId: user.id,
      variant: CandidateMatchVariant.StandMatch,
    };

    this.matches.push(match);

    user.items = difference(user.items, remainingItems);
  }
}
