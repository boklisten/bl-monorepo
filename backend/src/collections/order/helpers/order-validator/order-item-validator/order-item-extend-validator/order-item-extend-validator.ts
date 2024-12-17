import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { OrderItem } from "@shared/order/order-item/order-item";

export class OrderItemExtendValidator {
  private customerItemStorage: BlDocumentStorage<CustomerItem>;

  constructor(customerItemStorage?: BlDocumentStorage<CustomerItem>) {
    this.customerItemStorage = customerItemStorage
      ? customerItemStorage
      : new BlDocumentStorage(
          BlCollectionName.CustomerItems,
          customerItemSchema,
        );
  }

  public async validate(
    branch: Branch,
    orderItem: OrderItem,
  ): Promise<boolean> {
    try {
      this.validateFields(orderItem);
      this.checkPeriodType(orderItem, branch);
      await this.validateCustomerItem(branch, orderItem);
    } catch (e) {
      if (e instanceof BlError) {
        return Promise.reject(e);
      }
      return Promise.reject(
        new BlError(
          'unknown error, could not validate orderItem.type "extend"',
        ).store("error", e),
      );
    }

    return Promise.resolve(true);
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (
      this.customerItemStorage
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .get(orderItem.info.customerItem)
        .then((customerItem: CustomerItem) => {
          let totalOfSelectedPeriod = 0;
          if (customerItem.periodExtends) {
            for (const periodExtend of customerItem.periodExtends) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (periodExtend.periodType === orderItem.info.periodType) {
                totalOfSelectedPeriod += 1;
              }
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            for (const extendPeriod of branch.paymentInfo.extendPeriods) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (extendPeriod.type === orderItem.info.periodType) {
                if (totalOfSelectedPeriod > extendPeriod.maxNumberOfPeriods) {
                  throw new BlError(
                    "orderItem can not be extended any more times",
                  );
                }
              }
            }

            return true;
          }
          return undefined;
        })
        .catch((blError: BlError) => {
          return Promise.reject(blError);
        })
    );
  }

  private checkPeriodType(orderItem: OrderItem, branch: Branch) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!branch.paymentInfo.extendPeriods) {
      throw new BlError("the branch has no extendPeriods defined");
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (const extendPeriod of branch.paymentInfo.extendPeriods) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (extendPeriod.type === orderItem.info.periodType) {
        return true;
      }
    }

    throw new BlError(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      `orderItem.info.periodType is "${orderItem.info.periodType}" but it is not allowed by branch`,
    );
  }
}
