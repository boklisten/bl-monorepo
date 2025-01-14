import { isNullish } from "@backend/helper/typescript-helpers";
import { BlError } from "@shared/bl-error/bl-error";

export class DeliveryBringHandler {
  // @ts-expect-error fixme: auto ignored
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public validate(delivery: Delivery, order: Order): Promise<boolean> {
    if (isNullish(delivery.info)) {
      return Promise.reject(new BlError("delivery.info not defined"));
    }

    if (isNullish(delivery.info["from"])) {
      return Promise.reject(new BlError("delivery.info.from not defined"));
    }

    if (isNullish(delivery.info["to"])) {
      return Promise.reject(new BlError("delivery.info.to not defined"));
    }

    return Promise.resolve(true);
  }
}
