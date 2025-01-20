import { DeliveryHandler } from "@backend/collections/delivery/helpers/deliveryHandler/delivery-handler.js";
import { DeliveryValidator } from "@backend/collections/delivery/helpers/deliveryValidator/delivery-validator.js";
import { Hook } from "@backend/hook/hook.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { Order } from "@shared/order/order.js";
import { AccessToken } from "@shared/token/access-token.js";

export class DeliveryPostHook extends Hook {
  private deliveryValidator: DeliveryValidator;
  private deliveryHandler: DeliveryHandler;

  constructor(
    deliveryValidator?: DeliveryValidator,
    deliveryHandler?: DeliveryHandler,
  ) {
    super();
    this.deliveryValidator = deliveryValidator ?? new DeliveryValidator();
    this.deliveryHandler = deliveryHandler ?? new DeliveryHandler();
  }

  public override after(
    deliveries: Delivery[],
    accessToken?: AccessToken,
  ): Promise<Delivery[]> {
    if (!deliveries || deliveries.length <= 0) {
      return Promise.reject(new BlError("deliveries is empty or undefined"));
    }

    if (deliveries.length > 1) {
      return Promise.reject(new BlError("can not add more than one delivery"));
    }

    const delivery = deliveries[0];
    return new Promise((resolve, reject) => {
      BlStorage.Orders

        // @ts-expect-error fixme: auto ignored
        .get(delivery.order)
        .then((order: Order) => {
          this.deliveryValidator
            // @ts-expect-error fixme: auto ignored
            .validate(delivery)
            .then(() => {
              this.deliveryHandler

                // @ts-expect-error fixme: auto ignored
                .updateOrderBasedOnMethod(delivery, order, accessToken)
                .then((updatedDelivery: Delivery) => {
                  return resolve([updatedDelivery]);
                })
                .catch((blError: BlError) => {
                  return reject(blError);
                });
            })
            .catch((blError: BlError) => {
              return reject(blError);
            });
        })
        .catch((blError: BlError) => {
          return reject(blError);
        });
    });
  }
}
