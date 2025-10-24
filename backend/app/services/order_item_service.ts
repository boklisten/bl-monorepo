import { StorageService } from "#services/storage_service";
import { CustomerItem } from "#shared/customer-item/customer-item";
import { Item } from "#shared/item";
import { OrderItem } from "#shared/order/order-item/order-item";

export const OrderItemService = {
  async createBuyoutOrderItem(customerItem: CustomerItem, item: Item) {
    const branch = await StorageService.Branches.get(
      customerItem.handoutInfo?.handoutById,
    );
    const buyoutPercentage = branch.paymentInfo?.buyout?.percentage;
    if (!buyoutPercentage)
      throw new Error("Could not find buyout percentage in checkout!");

    const price = Math.ceil(item.price * buyoutPercentage);
    return {
      type: "buyout",
      item: item.id,
      title: item.title,
      delivered: false,
      amount: price,
      unitPrice: price,
      customerItem: customerItem.id,
    } as const satisfies OrderItem;
  },

  async createExtendOrderItem(
    customerItem: CustomerItem,
    item: Item,
    to: Date,
  ) {
    const branch = await StorageService.Branches.get(
      customerItem.handoutInfo?.handoutById,
    );
    const extendPeriod = branch.paymentInfo?.extendPeriods.find(
      (extendPeriod) =>
        extendPeriod.date.getMilliseconds() === to.getMilliseconds(),
    );
    if (!extendPeriod)
      throw new Error(
        `Extend period not found in checkout customer: ${customerItem.customer}, branch: ${branch.id}, customer item: ${customerItem.id}`,
      );

    if (
      (customerItem.periodExtends?.length ?? 0) >=
      extendPeriod.maxNumberOfPeriods
    )
      throw new Error(
        `Customer item does not qualify for extension: ${customerItem.customer}, branch: ${branch.id}, customer item: ${customerItem.id}`,
      );

    return {
      type: "extend",
      item: item.id,
      title: item.title,
      delivered: false,
      amount: extendPeriod.price,
      unitPrice: extendPeriod.price,
      info: {
        from: new Date(),
        to: extendPeriod.date,
        numberOfPeriods: 1,
        periodType: extendPeriod.type,
        customerItem: customerItem.id,
      },
    } as const satisfies OrderItem;
  },
  createBuyOrderItem(item: Item) {
    return {
      type: "buy",
      item: item.id,
      title: item.title,
      delivered: false,
      amount: item.price,
      unitPrice: item.price,
    } as const satisfies OrderItem;
  },
  async createRentOrderItem(item: Item, branchId: string, to: Date) {
    const branch = await StorageService.Branches.get(branchId);
    const rentPeriod = branch.paymentInfo?.rentPeriods.find(
      (rentPeriod) =>
        rentPeriod.date.getMilliseconds() === to.getMilliseconds(),
    );
    if (!rentPeriod)
      throw new Error(
        `Rent period not found in checkout branch: ${branchId} to: ${to.toISOString()} item: ${item.id}`,
      );

    return {
      type: "rent",
      item: item.id,
      title: item.title,
      delivered: false,
      amount: branch.paymentInfo?.responsible ? 0 : item.price,
      unitPrice: branch.paymentInfo?.responsible ? 0 : item.price,
      info: {
        from: new Date(),
        to: rentPeriod.date,
        numberOfPeriods: 1,
        periodType: rentPeriod.type,
      },
    } as const satisfies OrderItem;
  },

  async createPartlyPaymentOrderItem(item: Item, branchId: string, to: Date) {
    const branch = await StorageService.Branches.get(branchId);
    const partlyPaymentPeriod = branch.paymentInfo?.partlyPaymentPeriods?.find(
      (partlyPaymentPeriod) =>
        partlyPaymentPeriod.date.getMilliseconds() === to.getMilliseconds(),
    );
    if (!partlyPaymentPeriod)
      throw new Error(
        `Rent period not found in checkout branch: ${branchId} to: ${to.toISOString()} item: ${item.id}`,
      );

    return {
      type: "partly-payment",
      item: item.id,
      title: item.title,
      delivered: false,
      amount: branch.paymentInfo?.responsible ? 0 : item.price,
      unitPrice: branch.paymentInfo?.responsible ? 0 : item.price,
      info: {
        from: new Date(),
        to: partlyPaymentPeriod.date,
        numberOfPeriods: 1,
        periodType: partlyPaymentPeriod.type,
      },
    } as const satisfies OrderItem;
  },
};
