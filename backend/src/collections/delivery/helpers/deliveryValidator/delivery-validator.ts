import { DeliveryBranchHandler } from "@backend/collections/delivery/helpers/deliveryBranch/delivery-branch-handler.js";
import { DeliveryBringHandler } from "@backend/collections/delivery/helpers/deliveryBring/delivery-bring-handler.js";
import { isNullish } from "@backend/helper/typescript-helpers.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";

export class DeliveryValidator {
  private deliveryBranchHandler: DeliveryBranchHandler;
  private deliveryBringHandler: DeliveryBringHandler;

  constructor(
    deliveryBranchHandler?: DeliveryBranchHandler,
    deliveryBringHandler?: DeliveryBringHandler,
  ) {
    this.deliveryBranchHandler = deliveryBranchHandler
      ? deliveryBranchHandler
      : new DeliveryBranchHandler();
    this.deliveryBringHandler = deliveryBringHandler
      ? deliveryBringHandler
      : new DeliveryBringHandler();
  }

  public validate(delivery: Delivery): Promise<boolean> {
    if (isNullish(delivery.method)) {
      return Promise.reject(new BlError("delivery.method not defined"));
    }

    return this.validateBasedOnMethod(delivery);
  }

  private validateBasedOnMethod(delivery: Delivery): Promise<boolean> {
    switch (delivery.method) {
      case "branch": {
        return this.deliveryBranchHandler.validate(delivery);
      }
      case "bring": {
        return this.deliveryBringHandler.validate(delivery);
      }
      default: {
        return Promise.reject(
          new BlError(
            `delivery.method "${delivery.method}" is not supported`,
          ).store("delivery", delivery),
        );
      }
    }
  }
}
