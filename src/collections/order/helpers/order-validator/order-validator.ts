import { BlError, Branch, Order } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { branchSchema } from "@/collections/branch/branch.schema";
import { BranchValidator } from "@/collections/order/helpers/order-validator/branch-validator/branch-validator";
import { OrderFieldValidator } from "@/collections/order/helpers/order-validator/order-field-validator/order-field-validator";
import { OrderItemValidator } from "@/collections/order/helpers/order-validator/order-item-validator/order-item-validator";
import { OrderPlacedValidator } from "@/collections/order/helpers/order-validator/order-placed-validator/order-placed-validator";
import { OrderUserDetailValidator } from "@/collections/order/helpers/order-validator/order-user-detail-validator/order-user-detail-validator";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class OrderValidator {
  private orderPlacedValidator: OrderPlacedValidator;
  private orderItemValidator: OrderItemValidator;
  private branchValidator: BranchValidator;
  private branchStorage: BlDocumentStorage<Branch>;
  private orderFieldValidator: OrderFieldValidator;
  private orderUserDetailValidator: OrderUserDetailValidator;

  constructor(
    orderItemValidator?: OrderItemValidator,
    orderPlacedValidator?: OrderPlacedValidator,
    branchValidator?: BranchValidator,
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
    this.branchValidator = branchValidator
      ? branchValidator
      : new BranchValidator();
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
      await this.branchValidator.validate(order);
      await this.orderPlacedValidator.validate(order);
    } catch (e) {
      if (e instanceof BlError) {
        return Promise.reject(e);
      }
      return Promise.reject(
        new BlError("order could not be validated").store("error", e),
      );
    }
    return Promise.resolve(true);
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
