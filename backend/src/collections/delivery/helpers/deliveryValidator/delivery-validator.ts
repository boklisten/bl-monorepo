import { DeliveryBranchHandler } from "@backend/collections/delivery/helpers/deliveryBranch/delivery-branch-handler";
import { DeliveryBringHandler } from "@backend/collections/delivery/helpers/deliveryBring/delivery-bring-handler";
import { isNullish } from "@backend/helper/typescript-helpers";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";

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
      case "branch": {
        return this.deliveryBranchHandler.validate(delivery);
      }
      case "bring": {
        return this.deliveryBringHandler.validate(delivery, order);
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
