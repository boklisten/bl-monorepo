import {
  MatchableUser,
  MatchLocationSchema,
} from "@backend/collections/user-match/helpers/match-finder/match-types";
import { BlStorage } from "@backend/storage/blStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { ObjectId } from "mongodb";
import { z } from "zod";

/**
 * The information required to generate matches.
 */
export const MatchGenerateSpec = z.object({
  branches: z.string().array(),
  standLocation: z.string(),
  userMatchLocations: MatchLocationSchema.array(),
  startTime: z.string().datetime(),
  deadlineBefore: z.string().datetime(),
  matchMeetingDurationInMS: z.number(),
  includeCustomerItemsFromOtherBranches: z.boolean(),
});

/**
 * Get users that have open orders and/or have items in possession to be handed off
 *
 * @param branchIds The IDs of branches to search for users and items
 * @param deadlineBefore Select customer items that have a deadlineBefore between now() and this deadlineBefore
 * @param includeSenderItemsFromOtherBranches whether the remainder of the items that a customer has in possession should be added to the match, even though they were not handed out at the specified branchIds
 * @param customerItemStorage
 * @param orderStorage
 * @param userDetailStorage
 */
export async function getMatchableUsers(
  branchIds: string[],
  deadlineBefore: string,
  includeSenderItemsFromOtherBranches: boolean,
  customerItemStorage: BlStorage<CustomerItem>,
  orderStorage: BlStorage<Order>,
  userDetailStorage: BlStorage<UserDetail>,
): Promise<MatchableUser[]> {
  const [senders, receivers] = await Promise.all([
    getMatchableSender(
      branchIds,
      deadlineBefore,
      includeSenderItemsFromOtherBranches,
      customerItemStorage,
    ),
    getMatchableReceivers(branchIds, orderStorage),
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
      const userDetails = await userDetailStorage.get(user.id);
      if (userDetails.temporaryGroupMembership) {
        user.groupMembership = userDetails.temporaryGroupMembership;
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
 * @param customerItemStorage
 */
async function getMatchableSender(
  branchIds: string[],
  deadlineBefore: string,
  includeSenderItemsFromOtherBranches: boolean,
  customerItemStorage: BlStorage<CustomerItem>,
): Promise<MatchableUser[]> {
  const groupByCustomerStep = {
    $group: {
      _id: "$customer",
      id: { $first: "$customer" },
      items: { $addToSet: "$item" },
    },
  };

  let aggregatedSenders = (await customerItemStorage.aggregate([
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
        deadline: { $gt: new Date(), $lte: new Date(deadlineBefore) },
      },
    },
    groupByCustomerStep,
  ])) as { id: string; items: string[] }[];

  if (includeSenderItemsFromOtherBranches) {
    aggregatedSenders = (await customerItemStorage.aggregate([
      {
        $match: {
          customer: {
            $in: aggregatedSenders.map((sender) => new ObjectId(sender.id)),
          },
          returned: false,
          buyout: false,
          cancel: false,
          buyback: false,
          deadline: { $gt: new Date(), $lte: new Date(deadlineBefore) },
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
 * @param orderStorage
 */
async function getMatchableReceivers(
  branchIds: string[],
  orderStorage: BlStorage<Order>,
): Promise<MatchableUser[]> {
  const aggregatedReceivers = (await orderStorage.aggregate([
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
