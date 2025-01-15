import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { DeliveryHandler } from "@backend/collections/delivery/helpers/deliveryHandler/delivery-handler";
import { DeliveryValidator } from "@backend/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { OrderModel } from "@backend/collections/order/order.model";
import { Hook } from "@backend/hook/hook";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { AccessToken } from "@shared/token/access-token";

export class DeliveryPatchHook extends Hook {
  private deliveryValidator: DeliveryValidator;
  private deliveryStorage: BlStorage<Delivery>;
  private orderStorage: BlStorage<Order>;
  private deliveryHandler: DeliveryHandler;

  constructor(
    deliveryValidator?: DeliveryValidator,
    deliveryStorage?: BlStorage<Delivery>,
    orderStorage?: BlStorage<Order>,
    deliveryHandler?: DeliveryHandler,
  ) {
    super();
    this.deliveryValidator = deliveryValidator ?? new DeliveryValidator();
    this.deliveryStorage = deliveryStorage ?? new BlStorage(DeliveryModel);
    this.orderStorage = orderStorage ?? new BlStorage(OrderModel);
    this.deliveryHandler = deliveryHandler ?? new DeliveryHandler();
  }

  override before(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
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

    return this.tryToValidatePatch(body, accessToken, id)
      .then(() => {
        return true;
      })
      .catch((blError: BlError) => {
        throw blError;
      });
  }

  override after(
    deliveries: Delivery[],
    accessToken: AccessToken,
  ): Promise<Delivery[]> {
    const delivery = deliveries[0];

    return new Promise((resolve, reject) => {
      this.orderStorage
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

  private tryToValidatePatch(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    accessToken: AccessToken,
    id: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.deliveryStorage
        .get(id)
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
