import { OrderItemRentPeriodValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-period-validator/order-item-rent-period-validator.js";
import { isNullish } from "@backend/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Branch } from "@shared/branch/branch.js";
import { Item } from "@shared/item/item.js";
import { OrderItem } from "@shared/order/order-item/order-item.js";

export class OrderItemRentValidator {
  private orderItemRentPeriodValidator = new OrderItemRentPeriodValidator();

  public async validate(
    branch: Branch,
    orderItem: OrderItem,
    item: Item,
  ): Promise<boolean> {
    try {
      this.validateOrderItemInfoFields(orderItem);
      await this.orderItemRentPeriodValidator.validate(
        orderItem,
        // @ts-expect-error fixme: auto ignored
        branch.paymentInfo,
        item.price,
      );
      return true;
    } catch (error) {
      if (error instanceof BlError) {
        return Promise.reject(error);
      }
      return Promise.reject(
        new BlError(
          "unknown error, could not validate orderItem type rent",
        ).store("error", error),
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
