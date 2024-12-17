import { Order, OrderItem, BlError, Branch, Item } from "@boklisten/bl-model";

import { BlCollectionName } from "@/collections/bl-collection";
import { itemSchema } from "@/collections/item/item.schema";
import { OrderFieldValidator } from "@/collections/order/helpers/order-validator/order-field-validator/order-field-validator";
import { OrderItemBuyValidator } from "@/collections/order/helpers/order-validator/order-item-validator/order-item-buy-validator/order-item-buy-validator";
import { OrderItemExtendValidator } from "@/collections/order/helpers/order-validator/order-item-validator/order-item-extend-validator/order-item-extend-validator";
import { OrderItemPartlyPaymentValidator } from "@/collections/order/helpers/order-validator/order-item-validator/order-item-partly-payment-validator/order-item-partly-payment-validator";
import { OrderItemRentValidator } from "@/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-validator";
import { isNotNullish } from "@/helper/typescript-helpers";
import { PriceService } from "@/price/price.service";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class OrderItemValidator {
  private orderItemFieldValidator: OrderFieldValidator;
  private orderItemExtendValidator: OrderItemExtendValidator;
  private orderItemBuyValidator: OrderItemBuyValidator;
  private orderItemRentValidator: OrderItemRentValidator;
  private orderItemPartlyPaymentValidator: OrderItemPartlyPaymentValidator;
  private itemStorage: BlDocumentStorage<Item>;
  private priceService: PriceService;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    branchStorage?: BlDocumentStorage<Branch>,
    itemStorage?: BlDocumentStorage<Item>,
    orderItemFieldValidator?: OrderFieldValidator,
    orderItemRentValidator?: OrderItemRentValidator,
    orderItemBuyValidator?: OrderItemBuyValidator,
    orderItemExtendValidator?: OrderItemExtendValidator,
    orderItemPartlyPaymentValidator?: OrderItemPartlyPaymentValidator,
  ) {
    this.itemStorage =
      itemStorage ?? new BlDocumentStorage(BlCollectionName.Items, itemSchema);

    this.orderItemFieldValidator =
      orderItemFieldValidator ?? new OrderFieldValidator();
    this.orderItemRentValidator =
      orderItemRentValidator ?? new OrderItemRentValidator();
    this.orderItemBuyValidator =
      orderItemBuyValidator ?? new OrderItemBuyValidator();
    this.orderItemExtendValidator =
      orderItemExtendValidator ?? new OrderItemExtendValidator();
    this.priceService = new PriceService({ roundDown: true });
    this.orderItemPartlyPaymentValidator =
      orderItemPartlyPaymentValidator ?? new OrderItemPartlyPaymentValidator();
  }

  public async validate(
    branch: Branch,
    order: Order,
    isAdmin: boolean,
  ): Promise<boolean> {
    try {
      if (!isAdmin) {
        this.validateDeadlines(order.orderItems ?? []);
      }
      await this.orderItemFieldValidator.validate(order);
      this.assertNoDuplicateOrderItems(order.orderItems);
      this.validateAmount(order);

      for (const orderItem of order.orderItems) {
        const item = await this.itemStorage.get(orderItem.item);
        await this.validateOrderItemBasedOnType(branch, item, orderItem);
        this.validateOrderItemAmounts(orderItem);
      }
    } catch (e) {
      if (e instanceof BlError) {
        return Promise.reject(e);
      }
      return Promise.reject(
        new BlError("unknown error, orderItem could not be validated").store(
          "error",
          e,
        ),
      );
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return undefined;
  }

  private assertNoDuplicateOrderItems(orderItems: OrderItem[]): void {
    const blids = orderItems
      .filter(
        (orderItem) =>
          isNotNullish(orderItem.blid) &&
          ["partly-payment", "rent"].includes(orderItem.type),
      )
      .map((orderItem) => orderItem.blid);
    if (blids.length > 0 && blids.length !== new Set(blids).size)
      throw new BlError("order contains multiple of the same blid").code(814);
  }

  private async validateOrderItemBasedOnType(
    branch: Branch,
    item: Item,
    orderItem: OrderItem,
  ): Promise<boolean> {
    switch (orderItem.type) {
      case "rent":
        return await this.orderItemRentValidator.validate(
          branch,
          orderItem,
          item,
        );
      case "partly-payment":
        return await this.orderItemPartlyPaymentValidator.validate(
          orderItem,
          item,
          branch,
        );
      case "buy":
        return await this.orderItemBuyValidator.validate(
          branch,
          orderItem,
          item,
        );
      case "extend":
        return await this.orderItemExtendValidator.validate(branch, orderItem);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return undefined;
  }

  private validateOrderItemAmounts(orderItem: OrderItem) {
    const expectedTotalAmount = this.priceService.sanitize(
      orderItem.unitPrice + orderItem.taxAmount,
    );

    if (orderItem.amount !== expectedTotalAmount) {
      throw new BlError(
        `orderItem.amount "${orderItem.amount}" is not equal to orderItem.unitPrice "${orderItem.unitPrice}" + orderItem.taxAmount "${orderItem.taxAmount}"`,
      );
    }

    const expectedTaxAmount = this.priceService.sanitize(
      orderItem.unitPrice * orderItem.taxRate,
    );

    if (orderItem.taxAmount !== expectedTaxAmount) {
      throw new BlError(
        `orderItem.taxAmount "${orderItem.taxAmount}" is not equal to orderItem.unitPrice "${orderItem.unitPrice}" * orderItem.taxRate "${orderItem.taxRate}"`,
      );
    }
  }

  private validateAmount(order: Order): boolean {
    let expectedTotalAmount = 0;

    for (const orderItem of order.orderItems) {
      expectedTotalAmount += orderItem.amount;
    }

    if (expectedTotalAmount !== order.amount) {
      throw new BlError(
        `order.amount is "${order.amount}" but total of orderItems amount is "${expectedTotalAmount}"`,
      );
    }

    return true;
  }

  private validateDeadlines(orderItems: OrderItem[]) {
    const now = new Date();
    const nowWithGracePeriod = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 10,
    );
    const fourYearsFromNow = new Date(
      now.getFullYear() + 4,
      now.getMonth(),
      now.getDate(),
    );
    const hasExpiredDeadlines = orderItems.some((item) => {
      if (!item.info?.to) {
        return false;
      }
      const deadline = new Date(item.info.to);
      return nowWithGracePeriod > deadline;
    });

    const hasDeadlinesTooFarInTheFuture = orderItems.some((item) => {
      if (!item.info?.to) {
        return false;
      }
      const deadline = new Date(item.info.to);
      return deadline > fourYearsFromNow;
    });

    if (hasExpiredDeadlines) {
      throw new BlError("orderItem deadlines must be in the future").code(809);
    }

    if (hasDeadlinesTooFarInTheFuture) {
      throw new BlError(
        "orderItem deadlines must less than two years into the future",
      ).code(810);
    }
  }
}
