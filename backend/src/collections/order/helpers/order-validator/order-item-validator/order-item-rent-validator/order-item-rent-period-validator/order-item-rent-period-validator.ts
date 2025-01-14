import { APP_CONFIG } from "@backend/application-config";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { orderSchema } from "@backend/collections/order/order.schema";
import { isNotNullish } from "@backend/helper/typescript-helpers";
import { PriceService } from "@backend/price/price.service";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BranchPaymentInfo } from "@shared/branch/branch-payment-info";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { Period } from "@shared/period/period";

interface BranchPaymentPeriod {
  type: Period;
  date: Date;
  maxNumberOfPeriods: number;
  percentage: number;
}

export class OrderItemRentPeriodValidator {
  private _priceService: PriceService;

  constructor(private _orderStorage?: BlDocumentStorage<Order>) {
    this._orderStorage = _orderStorage
      ? _orderStorage
      : new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this._priceService = new PriceService(
      APP_CONFIG.payment.paymentServiceConfig,
    );
  }

  public async validate(
    orderItem: OrderItem,
    branchPaymentInfo: BranchPaymentInfo,
    itemPrice: number,
  ): Promise<boolean> {
    if (orderItem.type != "rent") {
      throw new BlError(
        'orderItem.type is not "rent" when validating rent period',
      );
    }

    if (branchPaymentInfo.responsible) {
      if (
        orderItem.amount !== 0 ||
        orderItem.taxAmount !== 0 ||
        orderItem.unitPrice !== 0
      ) {
        throw new BlError(
          "amounts where set on orderItem when branch is responsible",
        );
      }

      return true;
    }

    // @ts-expect-error fixme: auto ignored
    const period = orderItem.info.periodType;

    if (isNotNullish(orderItem.movedFromOrder)) {
      const branchPaymentPeriod = this.getRentPeriodFromBranchPaymentInfo(
        // @ts-expect-error fixme: auto ignored
        period,
        branchPaymentInfo,
      );
      return this.validateIfMovedFromOrder(
        orderItem,
        branchPaymentPeriod,
        itemPrice,
      );
    }

    const branchPaymentPeriod = this.getRentPeriodFromBranchPaymentInfo(
      // @ts-expect-error fixme: auto ignored
      period,
      branchPaymentInfo,
    );
    this.validateOrderItemPrice(orderItem, branchPaymentPeriod, itemPrice);

    return true;
  }

  private validateOrderItemPrice(
    orderItem: OrderItem,
    branchPaymentPeriod: BranchPaymentPeriod,
    itemPrice: number,
  ) {
    const expectedAmount = this._priceService.sanitize(
      this._priceService.round(itemPrice * branchPaymentPeriod.percentage),
    );

    if (expectedAmount !== orderItem.amount) {
      throw new BlError(
        `orderItem.amount "${orderItem.amount}" is not equal to itemPrice "${itemPrice}" * percentage "${branchPaymentPeriod.percentage}" "${expectedAmount}"`,
      );
    }
  }

  private getRentPeriodFromBranchPaymentInfo(
    period: Period,
    branchPaymentInfo: BranchPaymentInfo,
  ): BranchPaymentPeriod {
    for (const rentPeriod of branchPaymentInfo.rentPeriods) {
      if (period === rentPeriod.type) {
        return rentPeriod;
      }
    }

    throw new BlError(`rent period "${period}" is not valid on branch`);
  }

  private async validateIfMovedFromOrder(
    orderItem: OrderItem,
    branchRentPeriod: BranchPaymentPeriod,
    itemPrice: number,
  ): Promise<boolean> {
    if (!orderItem.movedFromOrder) {
      return true;
    }

    // @ts-expect-error fixme: auto ignored
    return this._orderStorage
      .get(orderItem.movedFromOrder)
      .then((order: Order) => {
        if (
          (!order.payments || order.payments.length <= 0) &&
          orderItem.amount === 0
        ) {
          throw new BlError(
            'the original order has not been payed, but current orderItem.amount is "0"',
          );
        }

        if (order.payments && order.payments.length > 0) {
          // the order is payed
          const movedFromOrderItem = this.getOrderItemFromOrder(
            orderItem.item,
            order,
          );

          if (
            // @ts-expect-error fixme: auto ignored
            movedFromOrderItem.info.periodType === orderItem.info.periodType
          ) {
            if (movedFromOrderItem.amount > 0 && orderItem.amount !== 0) {
              throw new BlError(
                `the original order has been payed, but current orderItem.amount is "${orderItem.amount}"`,
              );
            }
          } else {
            // the periodType is changed after the original placed order
            const expectedOrderItemAmount =
              this._priceService.round(
                this._priceService.sanitize(
                  itemPrice * branchRentPeriod.percentage,
                ),
              ) - movedFromOrderItem.amount;

            if (orderItem.amount !== expectedOrderItemAmount) {
              throw new BlError(
                `orderItem amount is "${orderItem.amount}" but should be "${expectedOrderItemAmount}" since the old orderItem.amount was "${movedFromOrderItem.amount}"`,
              );
            }
          }
        }
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  private getOrderItemFromOrder(itemId: string, order: Order): OrderItem {
    for (const orderItem of order.orderItems) {
      if (orderItem.item.toString() === itemId.toString()) {
        return orderItem;
      }
    }

    throw new BlError("not found in original orderItem");
  }
}
