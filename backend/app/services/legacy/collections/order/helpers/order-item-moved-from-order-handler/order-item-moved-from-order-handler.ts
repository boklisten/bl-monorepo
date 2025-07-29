import { isNullish } from "#services/helper/typescript-helpers";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error";
import { Order } from "#shared/order/order";

interface OrderItemToUpdate {
  itemId: string;
  originalOrderId: string;
  newOrderId: string;
}

export class OrderItemMovedFromOrderHandler {
  public async updateOrderItems(order: Order): Promise<boolean> {
    const orderItemsToUpdate: OrderItemToUpdate[] = order.orderItems
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

  private async addMovedToOrderOnOrderItems(
    orderItemsToUpdate: OrderItemToUpdate[],
  ): Promise<boolean> {
    for (const orderItemToUpdate of orderItemsToUpdate) {
      await this.updateOrderItem(orderItemToUpdate);
    }
    return true;
  }

  private async updateOrderItem(
    orderItemToUpdate: OrderItemToUpdate,
  ): Promise<boolean> {
    const originalOrder = await BlStorage.Orders.get(
      orderItemToUpdate.originalOrderId,
    );

    for (const orderItem of originalOrder.orderItems) {
      if (orderItem.item === orderItemToUpdate.itemId) {
        if (!orderItem.movedToOrder) {
          orderItem.movedToOrder = orderItemToUpdate.newOrderId;
        } else if (orderItem.movedToOrder !== orderItemToUpdate.newOrderId) {
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
