import {
  CandidateMatchVariant,
  MatchableUser,
  MatchLocation,
  MatchWithMeetingInfo,
} from "@backend/collections/match/helpers/match-finder-2/match-types";
import { isBoolean, isNotNullish } from "@backend/helper/typescript-helpers";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Match, StandMatch, UserMatch } from "@shared/match/match";
import { Order } from "@shared/order/order";
import { ObjectId } from "mongodb";

/**
 * The information required to generate matches.
 */
export interface MatcherSpec {
  senderBranches: string[];
  receiverBranches: string[];
  standLocation: string;
  userMatchLocations: MatchLocation[];
  startTime: string;
  deadlineBefore: string;
  matchMeetingDurationInMS: number;
  includeSenderItemsFromOtherBranches: boolean;
  additionalReceiverItems: Record<string, string[]>;
  deadlineOverrides: Record<string, string>;
}

export function candidateMatchToMatch(
  candidate: MatchWithMeetingInfo,
  deadlineOverrides: Record<string, string>,
): Match {
  switch (candidate.variant) {
    case CandidateMatchVariant.StandMatch:
      return new StandMatch(
        candidate.userId,
        Array.from(candidate.handoffItems),
        Array.from(candidate.pickupItems),
        candidate.meetingInfo,
      );
    case CandidateMatchVariant.UserMatch:
      return new UserMatch(
        candidate.senderId,
        candidate.receiverId,
        Array.from(candidate.items),
        candidate.meetingInfo,
        deadlineOverrides,
      );
  }
}

/**
 * Get the branches' items which users need to return, grouped by user.
 *
 * @param branchIds The IDs of branches to search for users and items
 * @param deadlineBefore Select customer items that have a deadlineBefore between now() and this deadlineBefore
 * @param includeSenderItemsFromOtherBranches whether the remainder of the items that a customer has in possession should be added to the match, even though they were not handed out at the specified branchIds
 * @param customerItemStorage
 */
export async function getMatchableSenders(
  branchIds: string[],
  deadlineBefore: string,
  includeSenderItemsFromOtherBranches: boolean,
  customerItemStorage: BlDocumentStorage<CustomerItem>,
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
  console.log("aggSenders: ", aggregatedSenders);

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
  additionalReceiverItems: Record<string, string[]>,
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

  for (const [branchId, receiverItems] of Object.entries(
    additionalReceiverItems,
  )) {
    for (const receiver of aggregatedReceivers) {
      if (receiver.branches.includes(branchId)) {
        receiver.items = [...receiver.items, ...receiverItems];
      }
    }
  }

  return aggregatedReceivers.map((receiver) => ({
    id: receiver.id,
    items: new Set(receiver.items),
  }));
}

export function verifyMatcherSpec(
  matcherSpec: unknown,
): matcherSpec is MatcherSpec {
  const m = matcherSpec as Record<string, unknown>;
  return (
    m &&
    Array.isArray(m["senderBranches"]) &&
    Array.isArray(m["receiverBranches"]) &&
    m["senderBranches"].every(
      (branchId) => typeof branchId === "string" && ObjectId.isValid(branchId),
    ) &&
    m["receiverBranches"].every(
      (branchId) => typeof branchId === "string" && ObjectId.isValid(branchId),
    ) &&
    Array.isArray(m["userMatchLocations"]) &&
    typeof m["standLocation"] === "string" &&
    m["standLocation"].length > 0 &&
    m["userMatchLocations"].every(
      (location) =>
        typeof location.name === "string" &&
        location.name.length > 0 &&
        (location.simultaneousMatchLimit === undefined ||
          (Number.isInteger(location.simultaneousMatchLimit) &&
            location.simultaneousMatchLimit > 0)),
    ) &&
    typeof m["startTime"] === "string" &&
    !isNaN(new Date(m["startTime"]).getTime()) &&
    typeof m["deadlineBefore"] === "string" &&
    !isNaN(new Date(m["deadlineBefore"]).getTime()) &&
    new Date(m["deadlineBefore"]).getTime() > new Date().getTime() &&
    typeof m["matchMeetingDurationInMS"] === "number" &&
    !isNaN(m["matchMeetingDurationInMS"]) &&
    isBoolean(m["includeSenderItemsFromOtherBranches"]) &&
    typeof m["additionalReceiverItems"] === "object" &&
    isNotNullish(m["additionalReceiverItems"]) &&
    Object.entries(m["additionalReceiverItems"]).every(
      ([branchId, itemIds]) =>
        typeof branchId === "string" &&
        ObjectId.isValid(branchId) &&
        Array.isArray(itemIds) &&
        itemIds.every(
          (itemId) => typeof itemId === "string" && ObjectId.isValid(itemId),
        ),
    ) &&
    typeof m["deadlineOverrides"] === "object" &&
    isNotNullish(m["deadlineOverrides"]) &&
    Object.entries(m["deadlineOverrides"]).every(
      ([itemId, newDeadline]) =>
        typeof itemId === "string" &&
        ObjectId.isValid(itemId) &&
        typeof newDeadline === "string" &&
        !isNaN(new Date(newDeadline).getTime()),
    )
  );
}
