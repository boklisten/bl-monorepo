import { BranchModel } from "@backend/collections/branch/branch.model";
import { DeliveryModel } from "@backend/collections/delivery/delivery.model";
import { BringDeliveryService } from "@backend/collections/delivery/helpers/deliveryBring/bringDelivery.service";
import { ItemModel } from "@backend/collections/item/item.model";
import { OrderModel } from "@backend/collections/order/order.model";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Delivery } from "@shared/delivery/delivery";
import { DeliveryInfoBring } from "@shared/delivery/delivery-info/delivery-info-bring";
import { Item } from "@shared/item/item";
import { Order } from "@shared/order/order";

export class DeliveryHandler {
  private orderStorage: BlStorage<Order>;
  private itemStorage: BlStorage<Item>;
  private bringDeliveryService: BringDeliveryService;
  private deliveryStorage: BlStorage<Delivery>;
  private branchStorage: BlStorage<Branch>;

  constructor(
    orderStorage?: BlStorage<Order>,
    branchStorage?: BlStorage<Branch>,
    itemStorage?: BlStorage<Item>,
    deliveryStorage?: BlStorage<Delivery>,
    bringDeliveryService?: BringDeliveryService,
  ) {
    this.orderStorage = orderStorage ?? new BlStorage(OrderModel);
    this.itemStorage = itemStorage ?? new BlStorage(ItemModel);
    this.bringDeliveryService =
      bringDeliveryService ?? new BringDeliveryService();
    this.deliveryStorage = deliveryStorage ?? new BlStorage(DeliveryModel);
    this.branchStorage = branchStorage ?? new BlStorage(BranchModel);
  }

  public updateOrderBasedOnMethod(
    delivery: Delivery,
    order: Order,
  ): Promise<Delivery> {
    switch (delivery.method) {
      case "branch": {
        return this.updateOrderWithDeliveryMethodBranch(delivery, order);
      }
      case "bring": {
        return this.updateOrderWithDeliveryMethodBring(delivery, order);
      }
    }
  }

  private updateOrderWithDeliveryMethodBranch(
    delivery: Delivery,
    order: Order,
  ): Promise<Delivery> {
    return this.updateOrder(order, delivery)
      .then(() => {
        return delivery;
      })
      .catch((blError: BlError) => {
        throw blError;
      });
  }

  private updateOrderWithDeliveryMethodBring(
    delivery: Delivery,
    order: Order,
  ): Promise<Delivery> {
    return new Promise((resolve, reject) => {
      this.fetchItems(order).then((items: Item[]) => {
        this.getBringDeliveryInfoAndUpdateDelivery(order, delivery, items)
          .then((updatedDelivery: Delivery) => {
            this.updateOrder(order, updatedDelivery)
              .then(() => {
                resolve(updatedDelivery);
              })
              .catch((blError: BlError) => {
                return reject(blError);
              });
          })
          .catch((bringDeliveryInfoError) => {
            reject(
              new BlError("failed to get bring delivery info").add(
                bringDeliveryInfoError,
              ),
            );
          });
      });
    });
  }

  private updateOrder(order: Order, delivery: Delivery): Promise<boolean> {
    const orderUpdateData = { delivery: delivery.id };

    return this.orderStorage
      .update(order.id, orderUpdateData)
      .then(() => {
        return true;
      })
      .catch((blError: BlError) => {
        throw new BlError("could not update order").add(blError);
      });
  }

  private fetchItems(order: Order): Promise<Item[]> {
    return new Promise((resolve, reject) => {
      const itemIds: string[] = order.orderItems.map(
        (orderItem) => orderItem.item,
      );

      this.itemStorage
        .getMany(itemIds)
        .then((items: Item[]) => {
          resolve(items);
        })
        .catch((blError: BlError) => {
          reject(blError);
        });
    });
  }

  private getBringDeliveryInfoAndUpdateDelivery(
    order: Order,
    delivery: Delivery,
    items: Item[],
  ): Promise<Delivery> {
    return new Promise((resolve, reject) => {
      this.branchStorage
        .get(order.branch)
        .then((branch: Branch) => {
          const freeDelivery =
            (branch.paymentInfo && branch.paymentInfo.responsibleForDelivery) ||
            order.handoutByDelivery;

          this.bringDeliveryService
            .getDeliveryInfoBring(
              // @ts-expect-error fixme: auto ignored
              delivery.info["facilityAddress"],

              // @ts-expect-error fixme: auto ignored
              delivery.info["shipmentAddress"],
              items,

              // @ts-expect-error fixme: auto ignored
              freeDelivery,
            )
            .then((deliveryInfoBring: DeliveryInfoBring) => {
              // @ts-expect-error fixme: auto ignored
              if (delivery.info["trackingNumber"]) {
                deliveryInfoBring["trackingNumber"] =
                  // @ts-expect-error fixme: auto ignored
                  delivery.info["trackingNumber"];
              }

              this.deliveryStorage
                .update(delivery.id, {
                  amount: deliveryInfoBring.amount,
                  info: deliveryInfoBring,
                })
                .then((updatedDelivery: Delivery) => {
                  resolve(updatedDelivery);
                })
                .catch((updateDeliveryError: BlError) => {
                  reject(updateDeliveryError);
                });
            })
            .catch((blError) => {
              reject(blError);
            });
        })
        .catch((getBranchError: BlError) => {
          reject(getBranchError);
        });
    });
  }
}
