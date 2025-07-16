import { Infer } from "@vinejs/vine/types";
import { ObjectId } from "mongodb";

import { MatchFinder } from "#controllers/matches/helpers/match-finder/match-finder";
import { MatchableUser } from "#controllers/matches/helpers/match-finder/match-types";
import { BlStorage } from "#services/storage/bl-storage";
import { StandMatch } from "#shared/match/stand-match";
import { UserMatch } from "#shared/match/user-match";
import { matchGenerateSchema } from "#validators/matches";

/**
 * Get users that have open orders and/or have items in possession to be handed off
 *
 * @param branchIds The IDs of branches to search for users and items
 * @param deadlineBefore Select customer items that have a deadlineBefore between now() and this deadlineBefore
 * @param includeSenderItemsFromOtherBranches whether the remainder of the items that a customer has in possession should be added to the match, even though they were not handed out at the specified branchIds
 */
async function getMatchableUsers(
  branchIds: string[],
  deadlineBefore: Date,
  includeSenderItemsFromOtherBranches: boolean,
): Promise<MatchableUser[]> {
  const [senders, receivers] = await Promise.all([
    getMatchableSender(
      branchIds,
      deadlineBefore,
      includeSenderItemsFromOtherBranches,
    ),
    getMatchableReceivers(branchIds),
  ]);
  const matchableUsers: MatchableUser[] = [];
  for (const user of [...senders, ...receivers]) {
    const existingUser = matchableUsers.find((u) => u.id === user.id);
    if (existingUser) {
      existingUser.items = new Set([...existingUser.items, ...user.items]);
      existingUser.wantedItems = new Set([
        ...existingUser.wantedItems,
        ...user.wantedItems,
      ]);
    } else {
      matchableUsers.push(user);
    }
  }
  return await Promise.all(
    matchableUsers.map(async (user) => {
      const userDetails = await BlStorage.UserDetails.get(user.id);
      if (userDetails.branchMembership) {
        user.groupMembership = userDetails.branchMembership;
      } else {
        console.log("unknown: ", user);
      }
      return user;
    }),
  );
}

/**
 * Get the branches' items which users need to return, grouped by user.
 *
 * @param branchIds The IDs of branches to search for users and items
 * @param deadlineBefore Select customer items that have a deadlineBefore between now() and this deadlineBefore
 * @param includeSenderItemsFromOtherBranches whether the remainder of the items that a customer has in possession should be added to the match, even though they were not handed out at the specified branchIds
 */
async function getMatchableSender(
  branchIds: string[],
  deadlineBefore: Date,
  includeSenderItemsFromOtherBranches: boolean,
): Promise<MatchableUser[]> {
  const groupByCustomerStep = {
    $group: {
      _id: "$customer",
      id: { $first: "$customer" },
      items: { $addToSet: "$item" },
    },
  };

  let aggregatedSenders = (await BlStorage.CustomerItems.aggregate([
    {
      $match: {
        returned: false,
        buyout: false,
        cancel: false,
        buyback: false,
        "handoutInfo.handoutBy": "branch",
        "handoutInfo.handoutById": {
          $in: branchIds.map((branchId) => new ObjectId(branchId)),
        },
        deadline: { $gt: new Date(), $lte: deadlineBefore },
      },
    },
    groupByCustomerStep,
  ])) as { id: string; items: string[] }[];

  if (includeSenderItemsFromOtherBranches) {
    aggregatedSenders = (await BlStorage.CustomerItems.aggregate([
      {
        $match: {
          customer: {
            $in: aggregatedSenders.map((sender) => new ObjectId(sender.id)),
          },
          returned: false,
          buyout: false,
          cancel: false,
          buyback: false,
          deadline: { $gt: new Date(), $lte: deadlineBefore },
        },
      },
      groupByCustomerStep,
    ])) as { id: string; items: string[] }[];
  }

  return aggregatedSenders.map((sender) => ({
    id: sender.id,
    items: new Set(sender.items),
    wantedItems: new Set(),
    groupMembership: "unknown",
  }));
}

/**
 * Get the branches' items which need to be provided to users, grouped by user.
 *
 * @param branchIds The IDs of branches to search for users and items
 */
async function getMatchableReceivers(
  branchIds: string[],
): Promise<MatchableUser[]> {
  const aggregatedReceivers = (await BlStorage.Orders.aggregate([
    {
      $match: {
        placed: true,
        byCustomer: true,
        handoutByDelivery: { $ne: true },
        branch: {
          $in: branchIds.map((branchId) => new ObjectId(branchId)),
        },
      },
    },
    {
      $addFields: {
        orderItems: {
          $filter: {
            input: "$orderItems",
            as: "orderItem",
            cond: {
              $and: [
                { $not: "$$orderItem.handout" },
                { $not: "$$orderItem.movedToOrder" },
                {
                  $in: ["$$orderItem.type", ["rent", "partly-payment"]],
                },
              ],
            },
          },
        },
      },
    },
    {
      $match: {
        $expr: {
          $gt: [{ $size: "$orderItems" }, 0],
        },
      },
    },
    {
      $unwind: "$orderItems",
    },
    {
      $group: {
        _id: "$customer",
        id: { $first: "$customer" },
        wantedItems: { $addToSet: "$orderItems.item" },
        branches: { $addToSet: "$branch" },
      },
    },
  ])) as { id: string; wantedItems: string[]; branches: string[] }[];

  return aggregatedReceivers.map((receiver) => ({
    id: receiver.id,
    items: new Set(),
    wantedItems: new Set(receiver.wantedItems),
    groupMembership: "unknown",
  }));
}

export async function generateMatches({
  standLocation,
  branches,
  deadlineBefore,
  includeCustomerItemsFromOtherBranches,
}: Infer<typeof matchGenerateSchema>) {
  const matchableUsers = await getMatchableUsers(
    branches,
    deadlineBefore,
    includeCustomerItemsFromOtherBranches,
  );

  if (matchableUsers.length === 0) {
    return "No matchable users found";
  }

  /*
  const usersGroupedByMembership = new Map<string, string[]>();
  for (const user of matchableUsers) {
    const existingGroup = usersGroupedByMembership.get(user.groupMembership);
    if (existingGroup) {
      existingGroup.push(user.id);
    } else {
      usersGroupedByMembership.set(user.groupMembership, [user.id]);
    }
  }
  const [userMatches, standMatches] = assignMeetingInfoToMatches(
    new MatchFinder(matchableUsers).generateMatches(),
    usersGroupedByMembership,
    standLocation,
    userMatchLocations,
    new Date(startTime),
    matchMeetingDurationInMS,
  );
   */
  const membershipToTime = {
    "1STA+2MK": new Date("2025-01-17T10:40:00Z"),
    "1STB+1STC": new Date("2025-01-17T10:45:00Z"),
    "1STD+1STG": new Date("2025-01-17T10:50:00Z"),
    "1STE+1STH": new Date("2025-01-17T10:55:00Z"),
  };
  const [candidateUserMatches, candidateStandMatches] = new MatchFinder(
    matchableUsers,
  ).generateMatches();
  const userMatches: UserMatch[] = candidateUserMatches.map(
    (candidateUserMatch) => ({
      ...candidateUserMatch,
      id: "",
      expectedAToBItems: Array.from(candidateUserMatch.expectedAToBItems),
      expectedBToAItems: Array.from(candidateUserMatch.expectedBToAItems),
      receivedBlIdsCustomerA: [],
      deliveredBlIdsCustomerA: [],
      receivedBlIdsCustomerB: [],
      deliveredBlIdsCustomerB: [],
      itemsLockedToMatch: true,
      meetingInfo: {
        location: "Krøllalfaen",
        date: membershipToTime[
          // @ts-expect-error fixme: auto ignored : temporary for this round of matching (jan 2025)
          matchableUsers.find((u) => u.id === candidateUserMatch.customerA)
            ?.groupMembership
        ],
      },
    }),
  );
  const standMatches: StandMatch[] = candidateStandMatches.map(
    (candidateStandMatch) => ({
      ...candidateStandMatch,
      id: "",
      expectedHandoffItems: Array.from(
        candidateStandMatch.expectedHandoffItems,
      ),
      expectedPickupItems: Array.from(candidateStandMatch.expectedPickupItems),
      receivedItems: [],
      deliveredItems: [],
      meetingInfo: {
        location: standLocation,
        date: new Date("2025-01-17T10:45:00Z"),
      },
    }),
  );

  if (userMatches.length === 0 && standMatches.length === 0) {
    return "No matches generated";
  }

  const addedUserMatches = await BlStorage.UserMatches.addMany(userMatches);
  const addedStandMatches = await BlStorage.StandMatches.addMany(standMatches);

  return `Created ${addedUserMatches.length} user matches and ${addedStandMatches.length} stand matches`;
}
