import { BlCollectionName } from "@backend/collections/bl-collection";
import { orderSchema } from "@backend/collections/order/order.schema";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";

export class OrderActive {
  private _queryBuilder: SEDbQueryBuilder;

  constructor(private _orderStorage?: BlDocumentStorage<Order>) {
    this._orderStorage = this._orderStorage
      ? this._orderStorage
      : new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this._queryBuilder = new SEDbQueryBuilder();
  }

  public async getActiveOrders(userId: string): Promise<Order[]> {
    const databaseQuery = this._queryBuilder.getDbQuery({ customer: userId }, [
      { fieldName: "customer", type: "object-id" },
    ]);

    let orders: Order[];

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      orders = await this._orderStorage.getByQuery(databaseQuery);
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
