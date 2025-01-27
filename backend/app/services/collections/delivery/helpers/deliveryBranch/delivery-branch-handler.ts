import { BlError } from "#shared/bl-error/bl-error";
import { Delivery } from "#shared/delivery/delivery";

export class DeliveryBranchHandler {
  validate(delivery: Delivery): Promise<boolean> {
    if (delivery.amount > 0) {
      return Promise.reject(
        new BlError(
          `delivery.amount is "${delivery.amount}" but should be "0"`,
        ),
      );
    }

    return Promise.resolve(true);
  }
}
