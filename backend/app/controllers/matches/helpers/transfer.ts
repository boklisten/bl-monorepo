import { Infer } from "@vinejs/vine/types";
import { ObjectId } from "mongodb";

import { isNullish } from "#services/helper/typescript-helpers";
import { CustomerItemActiveBlid } from "#services/legacy/collections/customer-item/helpers/customer-item-active-blid";
import { OrderToCustomerItemGenerator } from "#services/legacy/collections/customer-item/helpers/order-to-customer-item-generator";
import { OrderActive } from "#services/legacy/collections/order/helpers/order-active/order-active";
import { OrderItemMovedFromOrderHandler } from "#services/legacy/collections/order/helpers/order-item-moved-from-order-handler/order-item-moved-from-order-handler";
import { OrderValidator } from "#services/legacy/collections/order/helpers/order-validator/order-validator";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error";
import { CustomerItem } from "#shared/customer-item/customer-item";
import { StandMatch } from "#shared/match/stand-match";
import { UserMatch } from "#shared/match/user-match";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";
import { matchTransferSchema } from "#validators/matches";

async function createMatchReceiveOrder(
  customerItem: CustomerItem,
  userDetailId: string,
): Promise<Omit<Order, "id">> {
  const item = await BlStorage.Items.get(customerItem.item);

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
  const branch = await BlStorage.Branches.get(
    originalReceiverOrderInfo.order.branch,
  );

  const movedFromOrder = originalReceiverOrderInfo.order.id;

  const originalOrderDeadline =
    originalReceiverOrderInfo.relevantOrderItem.info?.to;
  const branchRentDeadline = branch.paymentInfo?.rentPeriods?.[0]?.date;

  let deadline = originalOrderDeadline ?? branchRentDeadline;

  if (!deadline) {
    throw new BlError(
      "Cannot set deadline: no rent period for branch and no original order deadline",
    ).code(200);
  }
  // This is necessary because it's not actually a date in the database, and thus the type is wrong.
  // It might be solved in the future by Zod or some other strict parser/validation.
  deadline = new Date(deadline);

  return {
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

async function createMatchDeliverOrder(
  customerItem: CustomerItem,
  userDetailId: string,
): Promise<Omit<Order, "id">> {
  const item = await BlStorage.Items.get(customerItem.item);

  if (!item) {
    throw new BlError("Failed to get item");
  }

  if (isNullish(customerItem.handoutInfo)) {
    throw new BlError("No handout-info for customerItem").code(200);
  }
  const branch = await BlStorage.Branches.get(
    customerItem.handoutInfo.handoutById,
  );

  return {
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

const wrongSenderFeedback = `Boken du skannet tilhørte en annen elev enn den som ga deg den. Du skal beholde den, men eleven som ga deg boken er fortsatt ansvarlig for at den opprinnelige boken blir levert.`;

export async function transfer(
  detailsId: string,
  { blid }: Infer<typeof matchTransferSchema>,
) {
  let userFeedback;

  if (!isValidBlid(blid)) {
    return {
      feedback:
        "Feil strekkode. Bruk bokas unike ID. Se instruksjoner for hjelp",
    };
  }

  let blidNotActiveError = false;
  const [customerItem] = await new CustomerItemActiveBlid()
    .getActiveCustomerItems(blid)
    .catch(() => {
      blidNotActiveError = true;
      return [];
    });
  if (!customerItem || blidNotActiveError) {
    return {
      feedback:
        "Boka du har skannet er ikke aktiv. Vennligst lever den på stand",
    };
  }

  const foundReceiverUserMatch = await findReceiverUserMatch(
    detailsId,
    customerItem,
  );
  if (!foundReceiverUserMatch.success) {
    return { feedback: foundReceiverUserMatch.feedback };
  }
  const { receiverUserMatch } = foundReceiverUserMatch;
  const { senderStandMatch, senderUserMatch } =
    await findSenderMatch(customerItem);

  if (
    isNullish(senderUserMatch) ||
    receiverUserMatch.id !== senderUserMatch.id
  ) {
    userFeedback = wrongSenderFeedback;
  }

  await returnSenderCustomerItem(customerItem);
  const placedReceiverOrder = await placeReceiverOrder(customerItem, detailsId);
  await recordReceiverCustomerItem(placedReceiverOrder);
  await updateReceiverUserMatch(receiverUserMatch, customerItem, detailsId);
  await updateSenderMatches(customerItem, senderUserMatch, senderStandMatch);

  return { feedback: userFeedback };
}

function isValidBlid(scannedText: string): boolean {
  if (Number.isNaN(Number(scannedText))) {
    if (scannedText.length === 12) {
      return true;
    }
  } else if (scannedText.length === 8) {
    return true;
  }
  return false;
}

async function updateSenderMatches(
  customerItem: CustomerItem,
  senderUserMatch: UserMatch | undefined,
  senderStandMatch: StandMatch | undefined,
): Promise<void> {
  if (senderUserMatch !== undefined) {
    let update: Partial<UserMatch>;
    if (senderUserMatch.customerA === customerItem.customer) {
      update = {
        deliveredBlIdsCustomerA: [
          ...senderUserMatch.deliveredBlIdsCustomerA,
          customerItem?.blid ?? "",
        ],
      };
    } else {
      update = {
        deliveredBlIdsCustomerB: [
          ...senderUserMatch.deliveredBlIdsCustomerB,
          customerItem?.blid ?? "",
        ],
      };
    }
    await BlStorage.UserMatches.update(senderUserMatch.id, update);
    return;
  }

  if (senderStandMatch === undefined) {
    return;
  }

  await BlStorage.StandMatches.update(senderStandMatch.id, {
    deliveredItems: [...senderStandMatch.deliveredItems, customerItem.item],
  });
}

async function findReceiverUserMatch(
  receiverUserDetailId: string,
  customerItem: CustomerItem,
): Promise<
  | { success: true; receiverUserMatch: UserMatch }
  | { success: false; feedback: string }
> {
  const receiverUserMatch = (
    await getUserMatchesForCustomer(receiverUserDetailId)
  ).find(
    (userMatch) =>
      (userMatch.customerA === receiverUserDetailId &&
        userMatch.expectedBToAItems.includes(customerItem.item)) ||
      (userMatch.customerB === receiverUserDetailId &&
        userMatch.expectedAToBItems.includes(customerItem.item)),
  );

  if (!receiverUserMatch) {
    return {
      success: false,
      feedback:
        "Du har ikke bestilt boken du skannet. Vennligst kom på stand dersom du faktisk skal ha boka.",
    };
  }

  const receivedBlIds =
    receiverUserMatch.customerA === receiverUserDetailId
      ? receiverUserMatch.receivedBlIdsCustomerA
      : receiverUserMatch.receivedBlIdsCustomerB;

  if (receivedBlIds.includes(customerItem?.blid ?? "")) {
    return { success: false, feedback: "Du har allerede skannet denne boka." };
  }

  const receivedItemIds = await Promise.all(
    receivedBlIds.map(async (blId) => {
      const uniqueItemQuery = new SEDbQuery();
      uniqueItemQuery.stringFilters = [{ fieldName: "blid", value: blId }];
      return (await BlStorage.UniqueItems.getByQuery(uniqueItemQuery))[0]?.item;
    }),
  );

  if (receivedItemIds.includes(customerItem.item)) {
    return { success: false, feedback: "Du har allerede skannet denne boka." };
  }
  return { success: true, receiverUserMatch };
}

async function findSenderMatch(customerItem: CustomerItem): Promise<{
  senderUserMatch: UserMatch | undefined;
  senderStandMatch: StandMatch | undefined;
}> {
  const senderUserMatches = await getUserMatchesForCustomer(
    customerItem.customer,
  );
  const senderUserMatch = senderUserMatches.find(
    (userMatch) =>
      (userMatch.customerB === customerItem.customer &&
        userMatch.expectedBToAItems.includes(customerItem.item)) ||
      (userMatch.customerA === customerItem.customer &&
        userMatch.expectedAToBItems.includes(customerItem.item)),
  );

  const potentialSenderStandMatch = await getStandMatchForCustomer(
    customerItem.customer,
  );
  const senderStandMatch =
    potentialSenderStandMatch?.expectedHandoffItems.includes(customerItem.item)
      ? potentialSenderStandMatch
      : undefined;
  return { senderUserMatch, senderStandMatch };
}

async function placeReceiverOrder(
  customerItem: CustomerItem,
  receiverUserDetailId: string,
): Promise<Order> {
  const receiverOrder = await createMatchReceiveOrder(
    customerItem,
    receiverUserDetailId,
  );

  const placedReceiverOrder = await BlStorage.Orders.add(receiverOrder);

  await new OrderValidator().validate(placedReceiverOrder, false);

  const orderMovedToHandler = new OrderItemMovedFromOrderHandler();
  await orderMovedToHandler.updateOrderItems(placedReceiverOrder);
  return placedReceiverOrder;
}

async function recordReceiverCustomerItem(
  placedReceiverOrder: Order,
): Promise<void> {
  const [generatedReceiverCustomerItem] =
    await new OrderToCustomerItemGenerator().generate(placedReceiverOrder);

  if (generatedReceiverCustomerItem === undefined) {
    throw new BlError("Failed to create new customer items");
  }

  const addedCustomerItem = await BlStorage.CustomerItems.add(
    generatedReceiverCustomerItem,
  );

  await BlStorage.Orders.update(placedReceiverOrder.id, {
    orderItems: placedReceiverOrder.orderItems.map((orderItem) => ({
      ...orderItem,
      customerItem: addedCustomerItem.id,
    })),
  });
}

async function returnSenderCustomerItem(
  customerItem: CustomerItem,
): Promise<void> {
  const senderOrder = await createMatchDeliverOrder(
    customerItem,
    customerItem.customer,
  );

  const placedSenderOrder = await BlStorage.Orders.add(senderOrder);
  await new OrderValidator().validate(placedSenderOrder, false);

  await BlStorage.CustomerItems.update(customerItem.id, {
    returned: true,
  });
}

async function getUserMatchesForCustomer(
  customer: string,
): Promise<UserMatch[]> {
  return (await BlStorage.UserMatches.aggregate([
    {
      $match: {
        $or: [
          { customerA: new ObjectId(customer) },
          { customerB: new ObjectId(customer) },
        ],
      },
    },
  ])) as UserMatch[];
}

async function getStandMatchForCustomer(
  customer: string,
): Promise<StandMatch | undefined> {
  const standMatches = (await BlStorage.StandMatches.aggregate([
    {
      $match: {
        customer: new ObjectId(customer),
      },
    },
  ])) as StandMatch[];

  return standMatches[0];
}

async function updateReceiverUserMatch(
  receiverUserMatch: UserMatch,
  customerItem: CustomerItem,
  receiver: string,
): Promise<void> {
  let update: Partial<UserMatch>;
  if (receiverUserMatch.customerA === receiver) {
    update = {
      // We know there's a blid because we found the CustomerItem by blid
      receivedBlIdsCustomerA: [
        ...receiverUserMatch.receivedBlIdsCustomerA,
        customerItem?.blid ?? "",
      ],
    };
  } else {
    update = {
      // We know there's a blid because we found the CustomerItem by blid
      receivedBlIdsCustomerB: [
        ...receiverUserMatch.receivedBlIdsCustomerB,
        customerItem?.blid ?? "",
      ],
    };
  }
  await BlStorage.UserMatches.update(receiverUserMatch.id, update);
}
