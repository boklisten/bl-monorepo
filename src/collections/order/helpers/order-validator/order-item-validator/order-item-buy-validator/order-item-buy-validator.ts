import { BlError, Item, OrderItem, Branch, Order } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { orderSchema } from "@/collections/order/order.schema";
import { PriceService } from "@/price/price.service";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class OrderItemBuyValidator {
  private priceService: PriceService;
  private orderStorage: BlDocumentStorage<Order>;

  constructor(
    priceService?: PriceService,
    orderStorage?: BlDocumentStorage<Order>,
  ) {
    this.priceService = priceService ?? new PriceService({ roundDown: true });
    this.orderStorage =
      orderStorage ??
      new BlDocumentStorage<Order>(BlCollectionName.Orders, orderSchema);
  }

  public async validate(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    branch: Branch,
    orderItem: OrderItem,
    item: Item,
  ): Promise<boolean> {
    try {
      this.validateOrderItemFields(orderItem, item);

      await this.validateOrderItemPriceTypeBuy(orderItem, item);
    } catch (e) {
      if (e instanceof BlError) {
        return Promise.reject(e);
      }
      return Promise.reject(
        new BlError(
          "unknown error, could not validate price of orderItems, error: " +
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            e.message,
        ).store("error", e),
      );
    }

    return Promise.resolve(true);
  }

  private validateOrderItemFields(orderItem: OrderItem, item: Item): boolean {
    if (orderItem.taxRate != item.taxRate) {
      throw new BlError(
        `orderItem.taxRate "${orderItem.taxRate}" is not equal to item.taxRate "${item.taxRate}"`,
      );
    }

    const expectedTaxAmount = orderItem.amount * item.taxRate;

    if (orderItem.taxAmount != expectedTaxAmount) {
      throw new BlError(
        `orderItem.taxAmount "${orderItem.taxAmount}" is not equal to (orderItem.amount "${orderItem.amount}" * item.taxRate "${item.taxRate}") "${expectedTaxAmount}"`,
      );
    }

    return true;
  }

  private async validateIfMovedFromOrder(
    orderItem: OrderItem,
    itemPrice: number,
  ): Promise<boolean> {
    if (!orderItem.movedFromOrder) {
      return true;
    }

    await this.orderStorage
      .get(orderItem.movedFromOrder)
      .then((order: Order) => {
        if (
          (!order.payments || order.payments.length <= 0) &&
          orderItem.amount === 0
        ) {
          throw new BlError(
            'the original order has not been payed, but orderItem.amount is "0"',
          );
        }

        const movedFromOrderItem = this.getOrderItemFromOrder(
          orderItem.item,
          order,
        );

        const expectedOrderItemAmount =
          this.priceService.round(this.priceService.sanitize(itemPrice)) -
          movedFromOrderItem.amount;

        if (orderItem.amount !== expectedOrderItemAmount) {
          throw new BlError(
            `orderItem amount is "${orderItem.amount}" but should be "${expectedOrderItemAmount}"`,
          );
        }

        return true;
      })
      .catch(() => {
        return false;
      });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return undefined;
  }

  private getOrderItemFromOrder(itemId: string, order: Order): OrderItem {
    for (const orderItem of order.orderItems) {
      if (orderItem.item.toString() === itemId.toString()) {
        return orderItem;
      }
    }

    throw new BlError("not found in original orderItem");
  }

  private async validateOrderItemPriceTypeBuy(
    orderItem: OrderItem,
    item: Item,
  ): Promise<boolean> {
    let price;
    let discount = 0;

    if (
      orderItem.movedFromOrder !== undefined &&
      orderItem.movedFromOrder !== null
    ) {
      return await this.validateIfMovedFromOrder(orderItem, item.price);
    }

    if (orderItem.discount) {
      if (!orderItem.discount.amount) {
        throw new BlError(
          "orderItem.discount was set, but no discount.amount provided",
        );
      }

      discount = orderItem.discount.amount;

      price = this.priceService.sanitize(
        item.price - orderItem.discount.amount,
      );
    } else {
      price = this.priceService.sanitize(item.price);
    }

    const expectedPrice = this.priceService.round(price);

    if (orderItem.amount != expectedPrice) {
      throw new BlError(
        `orderItem.amount "${orderItem.amount}" is not equal to item.price "${item.price}" - orderItem.discount "${discount}" = "${expectedPrice}" when type is "buy"`,
      );
    }

    return true;
  }
}
