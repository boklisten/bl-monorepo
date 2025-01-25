import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { Order } from "@shared/order/order.js";
import { AccessToken } from "@shared/token/access-token.js";

import { DeliveryHandler } from "#services/collections/delivery/helpers/deliveryHandler/delivery-handler";
import { DeliveryValidator } from "#services/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { Hook } from "#services/hook/hook";
import { BlStorage } from "#services/storage/bl-storage";

export class DeliveryPatchHook extends Hook {
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

  override before(
    body: unknown,
    accessToken?: AccessToken,
    id?: string,
  ): Promise<boolean> {
    if (!body) {
      return Promise.reject(new BlError("body is undefined"));
    }

    if (!id) {
      return Promise.reject(new BlError("id is undefined"));
    }

    if (!accessToken) {
      return Promise.reject(new BlError("accessToken is undefined"));
    }

    return this.tryToValidatePatch(body, id)
      .then(() => {
        return true;
      })
      .catch((blError: BlError) => {
        throw blError;
      });
  }

  override after(deliveries: Delivery[]): Promise<Delivery[]> {
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
                .updateOrderBasedOnMethod(delivery, order)
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

  private tryToValidatePatch(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    id: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      BlStorage.Deliveries.get(id)
        .then((delivery: Delivery) => {
          if (body["info"]) {
            delivery.info = body["info"];
          }

          if (body["amount"] >= 0) {
            delivery.amount = body["amount"];
          }

          if (body["order"]) {
            delivery.order = body["order"];
          }
          if (body["method"]) {
            delivery.method = body["method"];
          }
          this.deliveryValidator
            .validate(delivery)
            .then(() => {
              return resolve(true);
            })
            .catch((blError: BlError) => {
              return reject(
                new BlError("patched delivery could not be validated")
                  .add(blError)
                  .store("delivery", delivery),
              );
            });
        })
        .catch((blError: BlError) => {
          return reject(new BlError(`delivery "${id}" not found`).add(blError));
        });
    });
  }
}
