import { OrderActive } from "@backend/lib/collections/order/helpers/order-active/order-active.js";
import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export async function createMatchReceiveOrder(customerItem, userDetailId) {
    const item = await BlStorage.Items.get(customerItem.item);
    if (!item) {
        throw new BlError("Failed to get item");
    }
    let originalReceiverOrderInfo = undefined;
    const orderActive = new OrderActive();
    originalReceiverOrderInfo = (await orderActive.getActiveOrders(userDetailId))
        .map((order) => ({
        order,
        relevantOrderItem: order.orderItems.find((orderItem) => orderActive.isOrderItemActive(orderItem) &&
            orderItem.item === customerItem.item &&
            orderItem.type === "rent"),
    }))
        .find(({ relevantOrderItem }) => relevantOrderItem !== undefined);
    if (!originalReceiverOrderInfo) {
        throw new BlError("No receiver order for match transfer item").code(200);
    }
    const branch = await BlStorage.Branches.get(originalReceiverOrderInfo.order.branch);
    const movedFromOrder = originalReceiverOrderInfo.order.id;
    const originalOrderDeadline = originalReceiverOrderInfo.relevantOrderItem.info?.to;
    const branchRentDeadline = branch.paymentInfo?.rentPeriods?.[0]?.date;
    let deadline = originalOrderDeadline ?? branchRentDeadline;
    if (!deadline) {
        throw new BlError("Cannot set deadline: no rent period for branch and no original order deadline").code(200);
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
export async function createMatchDeliverOrder(customerItem, userDetailId) {
    const item = await BlStorage.Items.get(customerItem.item);
    if (!item) {
        throw new BlError("Failed to get item");
    }
    if (isNullish(customerItem.handoutInfo)) {
        throw new BlError("No handout-info for customerItem").code(200);
    }
    const branch = await BlStorage.Branches.get(customerItem.handoutInfo.handoutById);
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
