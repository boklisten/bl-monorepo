import { Delivery, Order, BlError, AccessToken } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { deliverySchema } from "@/collections/delivery/delivery.schema";
import { DeliveryHandler } from "@/collections/delivery/helpers/deliveryHandler/delivery-handler";
import { DeliveryValidator } from "@/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { orderSchema } from "@/collections/order/order.schema";
import { Hook } from "@/hook/hook";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class DeliveryPatchHook extends Hook {
  private deliveryValidator?: DeliveryValidator;
  private deliveryStorage: BlDocumentStorage<Delivery>;
  private orderStorage: BlDocumentStorage<Order>;
  private deliveryHandler: DeliveryHandler;

  constructor(
    deliveryValidator?: DeliveryValidator,
    deliveryStorage?: BlDocumentStorage<Delivery>,
    orderStorage?: BlDocumentStorage<Order>,
    deliveryHandler?: DeliveryHandler,
  ) {
    super();
    this.deliveryValidator = deliveryValidator ?? new DeliveryValidator();
    this.deliveryStorage =
      deliveryStorage ??
      new BlDocumentStorage<Delivery>(
        BlCollectionName.Deliveries,
        deliverySchema,
      );
    this.orderStorage =
      orderStorage ??
      new BlDocumentStorage<Order>(BlCollectionName.Orders, orderSchema);
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
        return Promise.reject(blError);
      });
  }

  override after(
    deliveries: Delivery[],
    accessToken: AccessToken,
  ): Promise<Delivery[]> {
    const delivery = deliveries[0];

    return new Promise((resolve, reject) => {
      this.orderStorage
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .get(delivery.order)
        .then((order: Order) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.deliveryValidator
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .validate(delivery, order)
            .then(() => {
              this.deliveryHandler
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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

          this.orderStorage
            .get(delivery.order)
            .then((order: Order) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              this.deliveryValidator
                .validate(delivery, order)
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
              return reject(
                new BlError(`order "${delivery.order}" not found`).add(blError),
              );
            });
        })
        .catch((blError: BlError) => {
          return reject(new BlError(`delivery "${id}" not found`).add(blError));
        });
    });
  }
}
