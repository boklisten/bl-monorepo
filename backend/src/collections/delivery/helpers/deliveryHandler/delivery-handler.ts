import { BlCollectionName } from "@backend/collections/bl-collection";
import { branchSchema } from "@backend/collections/branch/branch.schema";
import { deliverySchema } from "@backend/collections/delivery/delivery.schema";
import { BringDeliveryService } from "@backend/collections/delivery/helpers/deliveryBring/bringDelivery.service";
import { itemSchema } from "@backend/collections/item/item.schema";
import { orderSchema } from "@backend/collections/order/order.schema";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Delivery } from "@shared/delivery/delivery";
import { DeliveryInfoBring } from "@shared/delivery/delivery-info/delivery-info-bring";
import { Item } from "@shared/item/item";
import { Order } from "@shared/order/order";
import { AccessToken } from "@shared/token/access-token";

export class DeliveryHandler {
  private orderStorage: BlDocumentStorage<Order>;
  private itemStorage: BlDocumentStorage<Item>;
  private bringDeliveryService: BringDeliveryService;
  private deliveryStorage?: BlDocumentStorage<Delivery>;
  private branchStorage?: BlDocumentStorage<Branch>;

  constructor(
    orderStorage?: BlDocumentStorage<Order>,
    branchStorage?: BlDocumentStorage<Branch>,
    itemStorage?: BlDocumentStorage<Item>,
    deliveryStorage?: BlDocumentStorage<Delivery>,
    bringDeliveryService?: BringDeliveryService,
  ) {
    this.orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this.itemStorage =
      itemStorage ?? new BlDocumentStorage(BlCollectionName.Items, itemSchema);
    this.bringDeliveryService =
      bringDeliveryService ?? new BringDeliveryService();
    this.deliveryStorage =
      deliveryStorage ??
      new BlDocumentStorage(BlCollectionName.Deliveries, deliverySchema);
    this.branchStorage =
      branchStorage ??
      new BlDocumentStorage(BlCollectionName.Branches, branchSchema);
  }

  public updateOrderBasedOnMethod(
    delivery: Delivery,
    order: Order,
    accessToken?: AccessToken,
  ): Promise<Delivery> {
    switch (delivery.method) {
      case "branch":
        return this.updateOrderWithDeliveryMethodBranch(
          delivery,
          order,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          accessToken,
        );
      case "bring":
        return this.updateOrderWithDeliveryMethodBring(
          delivery,
          order,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          accessToken,
        );
    }
  }

  private updateOrderWithDeliveryMethodBranch(
    delivery: Delivery,
    order: Order,
    accessToken: AccessToken,
  ): Promise<Delivery> {
    return this.updateOrder(order, delivery, accessToken)
      .then(() => {
        return delivery;
      })
      .catch((blError: BlError) => {
        return Promise.reject(blError);
      });
  }

  private updateOrderWithDeliveryMethodBring(
    delivery: Delivery,
    order: Order,
    accessToken: AccessToken,
  ): Promise<Delivery> {
    return new Promise((resolve, reject) => {
      this.fetchItems(order).then((items: Item[]) => {
        this.getBringDeliveryInfoAndUpdateDelivery(
          order,
          delivery,
          items,
          accessToken,
        )
          .then((updatedDelivery: Delivery) => {
            this.updateOrder(order, updatedDelivery, accessToken)
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

  private updateOrder(
    order: Order,
    delivery: Delivery,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const orderUpdateData = { delivery: delivery.id };

    return this.orderStorage
      .update(order.id, orderUpdateData, {
        id: accessToken.sub,
        permission: accessToken.permission,
      })
      .then(() => {
        return true;
      })
      .catch((blError: BlError) => {
        return Promise.reject(
          new BlError("could not update order").add(blError),
        );
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
    accessToken: AccessToken,
  ): Promise<Delivery> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.branchStorage
        .get(order.branch)
        .then((branch: Branch) => {
          const freeDelivery =
            (branch.paymentInfo && branch.paymentInfo.responsibleForDelivery) ||
            order.handoutByDelivery;

          this.bringDeliveryService
            .getDeliveryInfoBring(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              delivery.info["facilityAddress"],
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              delivery.info["shipmentAddress"],
              items,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              freeDelivery,
            )
            .then((deliveryInfoBring: DeliveryInfoBring) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (delivery.info["trackingNumber"]) {
                deliveryInfoBring["trackingNumber"] =
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  delivery.info["trackingNumber"];
              }

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              this.deliveryStorage
                .update(
                  delivery.id,
                  { amount: deliveryInfoBring.amount, info: deliveryInfoBring },
                  { id: accessToken.sub, permission: accessToken.permission },
                )
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
