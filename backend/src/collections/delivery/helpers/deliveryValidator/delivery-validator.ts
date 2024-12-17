import { Delivery, BlError, Order } from "@boklisten/bl-model";

import { DeliveryBranchHandler } from "@/collections/delivery/helpers/deliveryBranch/delivery-branch-handler";
import { DeliveryBringHandler } from "@/collections/delivery/helpers/deliveryBring/delivery-bring-handler";
import { isNullish } from "@/helper/typescript-helpers";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class DeliveryValidator {
  private deliveryBranchHandler: DeliveryBranchHandler;
  private deliveryBringHandler: DeliveryBringHandler;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    orderStorage?: BlDocumentStorage<Order>,
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

  public validate(delivery: Delivery, order: Order): Promise<boolean> {
    if (isNullish(delivery.method)) {
      return Promise.reject(new BlError("delivery.method not defined"));
    }

    return this.validateBasedOnMethod(delivery, order);
  }

  private validateBasedOnMethod(
    delivery: Delivery,
    order: Order,
  ): Promise<boolean> {
    switch (delivery.method) {
      case "branch":
        return this.deliveryBranchHandler.validate(delivery);
      case "bring":
        return this.deliveryBringHandler.validate(delivery, order);
      default:
        return Promise.reject(
          new BlError(
            `delivery.method "${delivery.method}" is not supported`,
          ).store("delivery", delivery),
        );
    }
  }
}
