import { DeliveryHandler } from "@backend/lib/collections/delivery/helpers/deliveryHandler/delivery-handler.js";
import { DeliveryValidator } from "@backend/lib/collections/delivery/helpers/deliveryValidator/delivery-validator.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class DeliveryPatchHook extends Hook {
    deliveryValidator;
    deliveryHandler;
    constructor(deliveryValidator, deliveryHandler) {
        super();
        this.deliveryValidator = deliveryValidator ?? new DeliveryValidator();
        this.deliveryHandler = deliveryHandler ?? new DeliveryHandler();
    }
    before(body, accessToken, id) {
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
            .catch((blError) => {
            throw blError;
        });
    }
    after(deliveries) {
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
                        .updateOrderBasedOnMethod(delivery, order)
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
    tryToValidatePatch(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body, id) {
        return new Promise((resolve, reject) => {
            BlStorage.Deliveries.get(id)
                .then((delivery) => {
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
                    .catch((blError) => {
                    return reject(new BlError("patched delivery could not be validated")
                        .add(blError)
                        .store("delivery", delivery));
                });
            })
                .catch((blError) => {
                return reject(new BlError(`delivery "${id}" not found`).add(blError));
            });
        });
    }
}
