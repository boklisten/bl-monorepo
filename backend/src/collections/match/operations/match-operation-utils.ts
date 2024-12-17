import {
  BlError,
  Branch,
  CustomerItem,
  Item,
  Match,
  Order,
  OrderItem,
} from "@boklisten/bl-model";

import { OrderActive } from "@/collections/order/helpers/order-active/order-active";
import { isNullish } from "@/helper/typescript-helpers";
import { SEDbQuery } from "@/query/se.db-query";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export async function createMatchReceiveOrder(
  customerItem: CustomerItem,
  userDetailId: string,
  itemStorage: BlDocumentStorage<Item>,
  branchStorage: BlDocumentStorage<Branch>,
  deadlineOverrides?: Record<string, string>,
): Promise<Order> {
  const item = await itemStorage.get(customerItem.item);

  if (!item) {
    throw new BlError("Failed to get item");
  }
  interface OriginalOrderInfo {
    order: Order;
    relevantOrderItem: OrderItem;
  }
  let originalReceiverOrderInfo: OriginalOrderInfo | undefined = undefined;

  const orderActive = new OrderActive();
  originalReceiverOrderInfo = (await orderActive.getActiveOrders(userDetailId))
    .map((order) => ({
      order,
      relevantOrderItem: order.orderItems.find(
        (orderItem) =>
          orderActive.isOrderItemActive(orderItem) &&
          orderItem.item === customerItem.item &&
          orderItem.type === "rent",
      ),
    }))
    .find(({ relevantOrderItem }) => relevantOrderItem !== undefined) as
    | OriginalOrderInfo
    | undefined;

  if (!originalReceiverOrderInfo) {
    throw new BlError("No receiver order for match transfer item").code(200);
  }
  const branch = await branchStorage.get(
    originalReceiverOrderInfo.order.branch,
  );

  const movedFromOrder = originalReceiverOrderInfo.order.id;

  const relevantDeadlineOverride = deadlineOverrides?.[item.id];
  const deadlineOverride = relevantDeadlineOverride
    ? new Date(relevantDeadlineOverride)
    : undefined;
  const originalOrderDeadline =
    originalReceiverOrderInfo.relevantOrderItem.info?.to;
  const branchRentDeadline = branch.paymentInfo?.rentPeriods?.[0]?.date;

  let deadline =
    deadlineOverride ?? originalOrderDeadline ?? branchRentDeadline;

  if (!deadline) {
    throw new BlError(
      "Cannot set deadline: no rent period for branch, no original order deadline and no override",
    ).code(200);
  }
  // This is necessary because it's not actually a date in the database, and thus the type is wrong.
  // It might be solved in the future by Zod or some other strict parser/validation.
  deadline = new Date(deadline);

  return {
    // @ts-expect-error id will be auto-generated
    id: undefined,
    placed: true,
    payments: [],
    amount: 0,
    branch: branch.id,
    customer: userDetailId,
    byCustomer: true,
    pendingSignature: false,
    orderItems: [
      {
        movedFromOrder,
        item: item.id,
        title: item.title,
        blid: customerItem?.blid ?? "",
        type: "match-receive",
        amount: 0,
        unitPrice: 0,
        taxRate: 0,
        taxAmount: 0,
        info: {
          from: new Date(),
          to: deadline,
          numberOfPeriods: 1,
          periodType: "semester",
        },
      },
    ],
  };
}

export async function createMatchDeliverOrder(
  customerItem: CustomerItem,
  userDetailId: string,
  itemStorage: BlDocumentStorage<Item>,
  branchStorage: BlDocumentStorage<Branch>,
): Promise<Order> {
  const item = await itemStorage.get(customerItem.item);

  if (!item) {
    throw new BlError("Failed to get item");
  }

  if (isNullish(customerItem.handoutInfo)) {
    throw new BlError("No handout-info for customerItem").code(200);
  }
  const branch = await branchStorage.get(customerItem.handoutInfo.handoutById);

  return {
    // @ts-expect-error id will be auto-generated
    id: undefined,
    placed: true,
    payments: [],
    amount: 0,
    branch: branch.id,
    customer: userDetailId,
    byCustomer: true,
    pendingSignature: false,
    orderItems: [
      {
        item: item.id,
        title: item.title,
        blid: customerItem.blid ?? "",
        customerItem: customerItem.id,
        type: "match-deliver",
        amount: 0,
        unitPrice: 0,
        taxRate: 0,
        taxAmount: 0,
      },
    ],
  };
}

export async function getAllMatchesForUser(
  userDetailId: string,
  matchStorage: BlDocumentStorage<Match>,
): Promise<Match[]> {
  const query = new SEDbQuery();
  query.objectIdFilters = [
    // By putting each value in an array, the filters are OR'd instead of AND'd
    { fieldName: "customer", value: [userDetailId] },
    { fieldName: "sender", value: [userDetailId] },
    { fieldName: "receiver", value: [userDetailId] },
  ];

  try {
    return (await matchStorage.getByQuery(query)) as Match[];
  } catch (e) {
    if (e instanceof BlError && e.getCode() === 702) {
      return [];
    }
    throw e;
  }
}
