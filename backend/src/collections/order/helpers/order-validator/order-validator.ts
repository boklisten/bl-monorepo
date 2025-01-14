import { BlCollectionName } from "@backend/collections/bl-collection";
import { branchSchema } from "@backend/collections/branch/branch.schema";
import { OrderFieldValidator } from "@backend/collections/order/helpers/order-validator/order-field-validator/order-field-validator";
import { OrderItemValidator } from "@backend/collections/order/helpers/order-validator/order-item-validator/order-item-validator";
import { OrderPlacedValidator } from "@backend/collections/order/helpers/order-validator/order-placed-validator/order-placed-validator";
import { OrderUserDetailValidator } from "@backend/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Order } from "@shared/order/order";

export class OrderValidator {
  private orderPlacedValidator: OrderPlacedValidator;
  private orderItemValidator: OrderItemValidator;
  private branchStorage: BlDocumentStorage<Branch>;
  private orderFieldValidator: OrderFieldValidator;
  private orderUserDetailValidator: OrderUserDetailValidator;

  constructor(
    orderItemValidator?: OrderItemValidator,
    orderPlacedValidator?: OrderPlacedValidator,
    branchStorage?: BlDocumentStorage<Branch>,
    orderFieldValidator?: OrderFieldValidator,
    orderUserDetailValidator?: OrderUserDetailValidator,
  ) {
    this.orderItemValidator = orderItemValidator
      ? orderItemValidator
      : new OrderItemValidator();
    this.orderPlacedValidator = orderPlacedValidator
      ? orderPlacedValidator
      : new OrderPlacedValidator();
    this.branchStorage = branchStorage
      ? branchStorage
      : new BlDocumentStorage<Branch>(BlCollectionName.Branches, branchSchema);
    this.orderFieldValidator = orderFieldValidator
      ? orderFieldValidator
      : new OrderFieldValidator();
    this.orderUserDetailValidator = orderUserDetailValidator
      ? orderUserDetailValidator
      : new OrderUserDetailValidator();
  }

  public async validate(order: Order, isAdmin: boolean): Promise<boolean> {
    try {
      if (this.mustHaveCustomer(order)) {
        await this.orderUserDetailValidator.validate(order);
      }

      await this.orderFieldValidator.validate(order);
      const branch = await this.branchStorage.get(order.branch);

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
