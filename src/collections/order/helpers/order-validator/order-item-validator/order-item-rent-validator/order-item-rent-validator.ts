import { Branch, OrderItem, Item, BlError, Order } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { OrderItemRentPeriodValidator } from "@/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-period-validator/order-item-rent-period-validator";
import { orderSchema } from "@/collections/order/order.schema";
import { isNullish } from "@/helper/typescript-helpers";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class OrderItemRentValidator {
  private orderItemRentPeriodValidator: OrderItemRentPeriodValidator;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  constructor(private _orderStorage?: BlDocumentStorage<Order>) {
    this._orderStorage = _orderStorage
      ? _orderStorage
      : new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this.orderItemRentPeriodValidator = new OrderItemRentPeriodValidator();
  }

  public async validate(
    branch: Branch,
    orderItem: OrderItem,
    item: Item,
  ): Promise<boolean> {
    try {
      await this.validateOrderItemInfoFields(orderItem);
      await this.orderItemRentPeriodValidator.validate(
        orderItem,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        branch.paymentInfo,
        item.price,
      );
      return Promise.resolve(true);
    } catch (e) {
      if (e instanceof BlError) {
        return Promise.reject(e);
      }
      return Promise.reject(
        new BlError(
          "unknown error, could not validate orderItem type rent",
        ).store("error", e),
      );
    }
  }

  private validateOrderItemInfoFields(orderItem: OrderItem): boolean {
    if (isNullish(orderItem.info)) {
      throw new BlError(
        'orderItem.info is not set when orderItem.type is "rent"',
      );
    }
    return true;
  }
}
