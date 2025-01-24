import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class OrderItemMovedFromOrderHandler {
    async updateOrderItems(order) {
        const orderItemsToUpdate = order.orderItems
            .filter((orderItem) => orderItem.movedFromOrder)
            .map((orderItem) => {
            if (isNullish(orderItem.movedFromOrder)) {
                throw new BlError("Not movedFromOrder").code(200);
            }
            return {
                itemId: orderItem.item,
                originalOrderId: orderItem.movedFromOrder,
                newOrderId: order.id,
            };
        });
        return await this.addMovedToOrderOnOrderItems(orderItemsToUpdate);
    }
    async addMovedToOrderOnOrderItems(orderItemsToUpdate) {
        for (const orderItemToUpdate of orderItemsToUpdate) {
            await this.updateOrderItem(orderItemToUpdate);
        }
        return true;
    }
    async updateOrderItem(orderItemToUpdate) {
        const originalOrder = await BlStorage.Orders.get(orderItemToUpdate.originalOrderId);
        for (const orderItem of originalOrder.orderItems) {
            if (orderItem.item === orderItemToUpdate.itemId) {
                if (!orderItem.movedToOrder) {
                    orderItem.movedToOrder = orderItemToUpdate.newOrderId;
                }
                else if (orderItem.movedToOrder !== orderItemToUpdate.newOrderId) {
                    throw new BlError(`orderItem has "movedToOrder" already set`);
                }
            }
        }
        await BlStorage.Orders.update(orderItemToUpdate.originalOrderId, {
            orderItems: originalOrder.orderItems,
        });
        return true;
    }
}
