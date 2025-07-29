import { OrderFieldValidator } from "#services/legacy/collections/order/helpers/order-validator/order-field-validator/order-field-validator";
import { OrderItemValidator } from "#services/legacy/collections/order/helpers/order-validator/order-item-validator/order-item-validator";
import { OrderPlacedValidator } from "#services/legacy/collections/order/helpers/order-validator/order-placed-validator/order-placed-validator";
import { OrderUserDetailValidator } from "#services/legacy/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { Order } from "#shared/order/order";

export class OrderValidator {
  private orderPlacedValidator: OrderPlacedValidator;
  private orderItemValidator: OrderItemValidator;

  private orderFieldValidator: OrderFieldValidator;
  private orderUserDetailValidator: OrderUserDetailValidator;

  constructor(
    orderItemValidator?: OrderItemValidator,
    orderPlacedValidator?: OrderPlacedValidator,

    orderFieldValidator?: OrderFieldValidator,
    orderUserDetailValidator?: OrderUserDetailValidator,
  ) {
    this.orderItemValidator = orderItemValidator ?? new OrderItemValidator();
    this.orderPlacedValidator =
      orderPlacedValidator ?? new OrderPlacedValidator();

    this.orderFieldValidator = orderFieldValidator ?? new OrderFieldValidator();
    this.orderUserDetailValidator =
      orderUserDetailValidator ?? new OrderUserDetailValidator();
  }

  public async validate(order: Order, isAdmin: boolean): Promise<boolean> {
    try {
      if (this.mustHaveCustomer(order)) {
        await this.orderUserDetailValidator.validate(order);
      }

      await this.orderFieldValidator.validate(order);
      const branch = await BlStorage.Branches.get(order.branch);

      await this.orderItemValidator.validate(branch, order, isAdmin);
      await this.orderPlacedValidator.validate(order);
    } catch (error) {
      if (error instanceof BlError) {
        return Promise.reject(error);
      }
      return Promise.reject(
        new BlError("order could not be validated").store("error", error),
      );
    }
    return true;
  }

  private mustHaveCustomer(order: Order): boolean {
    for (const orderItem of order.orderItems) {
      if (orderItem.type !== "buy") {
        return true;
      }
    }

    return false;
  }
}
