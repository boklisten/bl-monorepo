import { SEDbQueryBuilder } from "#services/query/se.db-query-builder";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";

export class OrderActive {
  private queryBuilder = new SEDbQueryBuilder();

  public async getActiveOrders(userId: string): Promise<Order[]> {
    const databaseQuery = this.queryBuilder.getDbQuery({ customer: userId }, [
      { fieldName: "customer", type: "object-id" },
    ]);

    let orders: Order[];

    try {
      orders = await BlStorage.Orders.getByQuery(databaseQuery);
    } catch (error) {
      if (error instanceof BlError && error.getCode() === 702) {
        return [];
      }
      throw error;
    }

    return orders.filter((order) => this.isOrderActive(order));
  }

  public async haveActiveOrders(userId: string): Promise<boolean> {
    const activeOrders = await this.getActiveOrders(userId);
    return activeOrders.length > 0;
  }

  private isOrderActive(order: Order): boolean {
    return (
      order.placed === true &&
      order.orderItems.some((orderItem) => this.isOrderItemActive(orderItem))
    );
  }

  public isOrderItemActive(orderItem: OrderItem): boolean {
    return !(
      orderItem.handout ||
      orderItem.delivered ||
      orderItem.movedToOrder
    );
  }
}
