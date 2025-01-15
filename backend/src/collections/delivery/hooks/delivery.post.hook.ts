import { DeliveryHandler } from "@backend/collections/delivery/helpers/deliveryHandler/delivery-handler";
import { DeliveryValidator } from "@backend/collections/delivery/helpers/deliveryValidator/delivery-validator";
import { OrderModel } from "@backend/collections/order/order.model";
import { Hook } from "@backend/hook/hook";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { AccessToken } from "@shared/token/access-token";

export class DeliveryPostHook extends Hook {
  private orderStorage: BlStorage<Order>;
  private deliveryValidator: DeliveryValidator;
  private deliveryHandler: DeliveryHandler;

  constructor(
    deliveryValidator?: DeliveryValidator,
    deliveryHandler?: DeliveryHandler,
    orderStorage?: BlStorage<Order>,
  ) {
    super();
    this.deliveryValidator = deliveryValidator ?? new DeliveryValidator();
    this.deliveryHandler = deliveryHandler ?? new DeliveryHandler();
    this.orderStorage = orderStorage ?? new BlStorage(OrderModel);
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
}
