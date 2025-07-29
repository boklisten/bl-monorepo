import { isNotNullish } from "#services/helper/typescript-helpers";
import { OrderFieldValidator } from "#services/legacy/collections/order/helpers/order-validator/order-field-validator/order-field-validator";
import { OrderItemBuyValidator } from "#services/legacy/collections/order/helpers/order-validator/order-item-validator/order-item-buy-validator/order-item-buy-validator";
import { OrderItemExtendValidator } from "#services/legacy/collections/order/helpers/order-validator/order-item-validator/order-item-extend-validator/order-item-extend-validator";
import { OrderItemPartlyPaymentValidator } from "#services/legacy/collections/order/helpers/order-validator/order-item-validator/order-item-partly-payment-validator/order-item-partly-payment-validator";
import { OrderItemRentValidator } from "#services/legacy/collections/order/helpers/order-validator/order-item-validator/order-item-rent-validator/order-item-rent-validator";
import { PriceService } from "#services/price/price.service";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error/bl-error";
import { Branch } from "#shared/branch/branch";
import { Item } from "#shared/item/item";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";

export class OrderItemValidator {
  private orderItemFieldValidator: OrderFieldValidator;
  private orderItemExtendValidator: OrderItemExtendValidator;
  private orderItemBuyValidator: OrderItemBuyValidator;
  private orderItemRentValidator: OrderItemRentValidator;
  private orderItemPartlyPaymentValidator: OrderItemPartlyPaymentValidator;
  private priceService: PriceService;

  constructor(
    orderItemFieldValidator?: OrderFieldValidator,
    orderItemRentValidator?: OrderItemRentValidator,
    orderItemBuyValidator?: OrderItemBuyValidator,
    orderItemExtendValidator?: OrderItemExtendValidator,
    orderItemPartlyPaymentValidator?: OrderItemPartlyPaymentValidator,
  ) {
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
        const item = await BlStorage.Items.get(orderItem.item);
        await this.validateOrderItemBasedOnType(branch, item, orderItem);
        this.validateOrderItemAmounts(orderItem);
      }
    } catch (error) {
      if (error instanceof BlError) {
        return Promise.reject(error);
      }
      return Promise.reject(
        new BlError("unknown error, orderItem could not be validated").store(
          "error",
          error,
        ),
      );
    }

    // @ts-expect-error fixme: auto ignored
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
      case "rent": {
        return await this.orderItemRentValidator.validate(
          branch,
          orderItem,
          item,
        );
      }
      case "partly-payment": {
        return await this.orderItemPartlyPaymentValidator.validate(
          orderItem,
          item,
          branch,
        );
      }
      case "buy": {
        return await this.orderItemBuyValidator.validate(
          branch,
          orderItem,
          item,
        );
      }
      case "extend": {
        return await this.orderItemExtendValidator.validate(branch, orderItem);
      }
    }

    // @ts-expect-error fixme: auto ignored
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
