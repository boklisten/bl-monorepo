import {
  MatchableUser,
  MatchLocationSchema,
  MatchWithMeetingInfo,
} from "@backend/collections/user-match/helpers/match-finder/match-types";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Order } from "@shared/order/order";
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

export function candidateStandMatchToStandMatch(
  candidate: MatchWithMeetingInfo,
  deadlineOverrides: Record<string, string>,
): Match {
  switch (candidate.variant) {
    case CandidateMatchVariant.StandMatch: {
      return new StandMatch(
        candidate.userId,
        [...candidate.handoffItems],
        [...candidate.pickupItems],
        candidate.meetingInfo,
      );
    }
    case CandidateMatchVariant.UserMatch: {
      return new UserMatch(
        candidate.senderId,
        candidate.receiverId,
        [...candidate.items],
        candidate.meetingInfo,
        deadlineOverrides,
      );
    }
  }
}

/**
 * Get the branches' items which users need to return, grouped by user.
 *
 * @param branchIds The IDs of branches to search for users and items
 * @param deadlineBefore Select customer items that have a deadlineBefore between now() and this deadlineBefore
 * @param includeSenderItemsFromOtherBranches whether the remainder of the items that a customer has in possession should be added to the match, even though they were not handed out at the specified branchIds
 * @param customerItemStorage
 * @param orderStorage
 */
export async function getMatchableSenders(
  branchIds: string[],
  deadlineBefore: string,
  includeSenderItemsFromOtherBranches: boolean,
  customerItemStorage: BlDocumentStorage<CustomerItem>,
  orderStorage: BlDocumentStorage<Order>,
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
  }));
}

/**
 * Get the branches' items which need to be provided to users, grouped by user.
 *
 * @param branchIds The IDs of branches to search for users and items
 * @param orderStorage
 * @param additionalReceiverItems items that should get even without an order (known required courses)
 */
export async function getMatchableReceivers(
  branchIds: string[],
  orderStorage: BlDocumentStorage<Order>,
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
        items: { $addToSet: "$orderItems.item" },
        branches: { $addToSet: "$branch" },
      },
    },
  ])) as { id: string; items: string[]; branches: string[] }[];

  return aggregatedReceivers.map((receiver) => ({
    id: receiver.id,
    items: new Set(receiver.items),
  }));
}