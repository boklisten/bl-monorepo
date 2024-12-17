import { OrderItem, Item, Branch, BlError } from "@boklisten/bl-model";

import { isNullish } from "@/helper/typescript-helpers";

export class OrderItemPartlyPaymentValidator {
  public validate(
    orderItem: OrderItem,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Item: Item,
    branch: Branch,
  ): Promise<boolean> {
    if (orderItem.type !== "partly-payment") {
      return Promise.reject(
        new BlError("orderItem not of type 'partly-payment'"),
      );
    }

    try {
      this.validateFields(orderItem);
    } catch (e) {
      return Promise.reject(e);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!this.isPeriodSupported(orderItem.info.periodType, branch)) {
      return Promise.reject(
        new BlError(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `partly-payment period "${orderItem.info.periodType}" not supported on branch`,
        ),
      );
    }

    return new Promise((resolve) => {
      resolve(true);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isPeriodSupported(period: any, branch: Branch) {
    if (branch.paymentInfo && branch.paymentInfo.partlyPaymentPeriods) {
      for (const partlyPaymentPeriod of branch.paymentInfo
        .partlyPaymentPeriods) {
        if (partlyPaymentPeriod.type === period) {
          return true;
        }
      }
    }

    return false;
  }

  private validateFields(orderItem: OrderItem) {
    if (isNullish(orderItem.info)) {
      throw new BlError("orderItem.info not specified");
    }

    if (orderItem.info && isNullish(orderItem.info.to)) {
      throw new BlError("orderItem.info.to not specified");
    }

    if (
      orderItem.info &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      isNullish(orderItem.info["amountLeftToPay"])
    ) {
      throw new BlError("orderItem.info.amountLeftToPay not specified");
    }
  }
}
