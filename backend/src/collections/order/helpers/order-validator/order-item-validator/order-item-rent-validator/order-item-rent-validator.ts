import { BlCollectionName } from "@backend/collections/bl-collection";
import { OrderItemRentPeriodValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-period-validator/order-item-rent-period-validator";
import { orderSchema } from "@backend/collections/order/order.schema";
import { isNullish } from "@backend/helper/typescript-helpers";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Item } from "@shared/item/item";
import { OrderItem } from "@shared/order/order-item/order-item";

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
