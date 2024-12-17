import { isNullish } from "@backend/helper/typescript-helpers";
import { BlError } from "@shared/bl-error/bl-error";

export class DeliveryBringHandler {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public validate(delivery: Delivery, order: Order): Promise<boolean> {
    if (isNullish(delivery.info)) {
      return Promise.reject(new BlError("delivery.info not defined"));
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (isNullish(delivery.info["from"])) {
      return Promise.reject(new BlError("delivery.info.from not defined"));
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (isNullish(delivery.info["to"])) {
      return Promise.reject(new BlError("delivery.info.to not defined"));
    }

    return Promise.resolve(true);
  }
}
