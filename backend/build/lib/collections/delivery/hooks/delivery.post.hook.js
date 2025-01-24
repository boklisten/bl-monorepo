import { DeliveryHandler } from "@backend/lib/collections/delivery/helpers/deliveryHandler/delivery-handler.js";
import { DeliveryValidator } from "@backend/lib/collections/delivery/helpers/deliveryValidator/delivery-validator.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class DeliveryPostHook extends Hook {
    deliveryValidator;
    deliveryHandler;
    constructor(deliveryValidator, deliveryHandler) {
        super();
        this.deliveryValidator = deliveryValidator ?? new DeliveryValidator();
        this.deliveryHandler = deliveryHandler ?? new DeliveryHandler();
    }
    after(deliveries, accessToken) {
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
                .then((order) => {
                this.deliveryValidator
                    // @ts-expect-error fixme: auto ignored
                    .validate(delivery)
                    .then(() => {
                    this.deliveryHandler
                        // @ts-expect-error fixme: auto ignored
                        .updateOrderBasedOnMethod(delivery, order, accessToken)
                        .then((updatedDelivery) => {
                        return resolve([updatedDelivery]);
                    })
                        .catch((blError) => {
                        return reject(blError);
                    });
                })
                    .catch((blError) => {
                    return reject(blError);
                });
            })
                .catch((blError) => {
                return reject(blError);
            });
        });
    }
}
