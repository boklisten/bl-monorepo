import { BringDeliveryService } from "@backend/lib/collections/delivery/helpers/deliveryBring/bringDelivery.service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class DeliveryHandler {
    bringDeliveryService;
    constructor(bringDeliveryService) {
        this.bringDeliveryService =
            bringDeliveryService ?? new BringDeliveryService();
    }
    updateOrderBasedOnMethod(delivery, order) {
        switch (delivery.method) {
            case "branch": {
                return this.updateOrderWithDeliveryMethodBranch(delivery, order);
            }
            case "bring": {
                return this.updateOrderWithDeliveryMethodBring(delivery, order);
            }
        }
    }
    updateOrderWithDeliveryMethodBranch(delivery, order) {
        return this.updateOrder(order, delivery)
            .then(() => {
            return delivery;
        })
            .catch((blError) => {
            throw blError;
        });
    }
    updateOrderWithDeliveryMethodBring(delivery, order) {
        return new Promise((resolve, reject) => {
            this.fetchItems(order).then((items) => {
                this.getBringDeliveryInfoAndUpdateDelivery(order, delivery, items)
                    .then((updatedDelivery) => {
                    this.updateOrder(order, updatedDelivery)
                        .then(() => {
                        resolve(updatedDelivery);
                    })
                        .catch((blError) => {
                        return reject(blError);
                    });
                })
                    .catch((bringDeliveryInfoError) => {
                    reject(new BlError("failed to get bring delivery info").add(bringDeliveryInfoError));
                });
            });
        });
    }
    updateOrder(order, delivery) {
        const orderUpdateData = { delivery: delivery.id };
        return BlStorage.Orders.update(order.id, orderUpdateData)
            .then(() => {
            return true;
        })
            .catch((blError) => {
            throw new BlError("could not update order").add(blError);
        });
    }
    fetchItems(order) {
        return new Promise((resolve, reject) => {
            const itemIds = order.orderItems.map((orderItem) => orderItem.item);
            BlStorage.Items.getMany(itemIds)
                .then((items) => {
                resolve(items);
            })
                .catch((blError) => {
                reject(blError);
            });
        });
    }
    getBringDeliveryInfoAndUpdateDelivery(order, delivery, items) {
        return new Promise((resolve, reject) => {
            BlStorage.Branches.get(order.branch)
                .then((branch) => {
                const freeDelivery = (branch.paymentInfo && branch.paymentInfo.responsibleForDelivery) ||
                    order.handoutByDelivery;
                this.bringDeliveryService
                    .getDeliveryInfoBring(
                // @ts-expect-error fixme: auto ignored
                delivery.info["facilityAddress"], 
                // @ts-expect-error fixme: auto ignored
                delivery.info["shipmentAddress"], items, 
                // @ts-expect-error fixme: auto ignored
                freeDelivery)
                    .then((deliveryInfoBring) => {
                    // @ts-expect-error fixme: auto ignored
                    if (delivery.info["trackingNumber"]) {
                        deliveryInfoBring["trackingNumber"] =
                            // @ts-expect-error fixme: auto ignored
                            delivery.info["trackingNumber"];
                    }
                    BlStorage.Deliveries.update(delivery.id, {
                        amount: deliveryInfoBring.amount,
                        info: deliveryInfoBring,
                    })
                        .then((updatedDelivery) => {
                        resolve(updatedDelivery);
                    })
                        .catch((updateDeliveryError) => {
                        reject(updateDeliveryError);
                    });
                })
                    .catch((blError) => {
                    reject(blError);
                });
            })
                .catch((getBranchError) => {
                reject(getBranchError);
            });
        });
    }
}
