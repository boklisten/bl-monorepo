import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { OrderItem } from "@shared/order/order-item/order-item";

export class OrderItemExtendValidator {
  private customerItemStorage: BlDocumentStorage<CustomerItem>;

  constructor(customerItemStorage?: BlDocumentStorage<CustomerItem>) {
    this.customerItemStorage =
      customerItemStorage ?? new BlDocumentStorage(CustomerItemModel);
  }

  public async validate(
    branch: Branch,
    orderItem: OrderItem,
  ): Promise<boolean> {
    try {
      this.validateFields(orderItem);
      this.checkPeriodType(orderItem, branch);
      await this.validateCustomerItem(branch, orderItem);
    } catch (error) {
      if (error instanceof BlError) {
        return Promise.reject(error);
      }
      return Promise.reject(
        new BlError(
          'unknown error, could not validate orderItem.type "extend"',
        ).store("error", error),
      );
    }

    return true;
  }

  private validateFields(orderItem: OrderItem): boolean {
    if (orderItem.type !== "extend") {
      throw new BlError(`orderItem.type "${orderItem.type}" is not "extend"`);
    }

    if (!orderItem.info) {
      throw new BlError("orderItem.info is not defined");
    }

    if (!orderItem.info.customerItem) {
      throw new BlError("orderItem.info.customerItem is not defined");
    }

    return true;
  }

  private validateCustomerItem(
    branch: Branch,
    orderItem: OrderItem,
  ): Promise<boolean> {
    // @ts-expect-error fixme: auto ignored
    return (
      this.customerItemStorage

        // @ts-expect-error fixme: auto ignored
        .get(orderItem.info.customerItem)
        .then((customerItem: CustomerItem) => {
          let totalOfSelectedPeriod = 0;
          if (customerItem.periodExtends) {
            for (const periodExtend of customerItem.periodExtends) {
              // @ts-expect-error fixme: auto ignored
              if (periodExtend.periodType === orderItem.info.periodType) {
                totalOfSelectedPeriod += 1;
              }
            }

            // @ts-expect-error fixme: auto ignored
            for (const extendPeriod of branch.paymentInfo.extendPeriods) {
              if (
                extendPeriod.type === orderItem.info?.periodType &&
                totalOfSelectedPeriod > extendPeriod.maxNumberOfPeriods
              ) {
                throw new BlError(
                  "orderItem can not be extended any more times",
                );
              }
            }

            return true;
          }
          return;
        })
        .catch((blError: BlError) => {
          throw blError;
        })
    );
  }

  private checkPeriodType(orderItem: OrderItem, branch: Branch) {
    // @ts-expect-error fixme: auto ignored
    if (!branch.paymentInfo.extendPeriods) {
      throw new BlError("the branch has no extendPeriods defined");
    }

    // @ts-expect-error fixme: auto ignored
    for (const extendPeriod of branch.paymentInfo.extendPeriods) {
      // @ts-expect-error fixme: auto ignored
      if (extendPeriod.type === orderItem.info.periodType) {
        return true;
      }
    }

    throw new BlError(
      // @ts-expect-error fixme: auto ignored
      `orderItem.info.periodType is "${orderItem.info.periodType}" but it is not allowed by branch`,
    );
  }
}
