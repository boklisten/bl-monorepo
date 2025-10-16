import { CustomerItemService } from "#services/customer_item_service";
import { SEDbQuery } from "#services/legacy/query/se.db-query";
import { StorageService } from "#services/storage_service";
import { Branch } from "#shared/branch";
import {
  BuyoutCartItem,
  BuyoutOrExtendCartItem,
  ExtendCartItem,
} from "#shared/checkout";
import { CustomerItem } from "#shared/customer-item/customer-item";
import { Item } from "#shared/item";
import { OrderItem } from "#shared/order/order-item/order-item";

function createBuyoutOrderItem(
  cartItem: BuyoutCartItem,
  item: Item,
  customerItem: CustomerItem,
  branch: Branch,
) {
  const buyoutPercentage = branch.paymentInfo?.buyout?.percentage;
  if (!buyoutPercentage)
    throw new Error("Could not find buyout percentage in checkout!");

  const price = Math.ceil(item.price * buyoutPercentage);
  return {
    type: cartItem.type,
    item: item.id,
    title: item.title,
    delivered: false,
    amount: price,
    unitPrice: price,
    taxRate: 0,
    taxAmount: 0,
    customerItem: customerItem.id,
  } as const satisfies OrderItem;
}

function createExtendOrderItem(
  customerId: string,
  cartItem: ExtendCartItem,
  item: Item,
  customerItem: CustomerItem,
  branch: Branch,
) {
  const extendPeriod = branch.paymentInfo?.extendPeriods.find(
    (extendPeriod) =>
      extendPeriod.date.getMilliseconds() === cartItem.date?.getMilliseconds(),
  );
  if (!extendPeriod)
    throw new Error(
      `Extend period not found in checkout customer: ${customerId}, branch: ${branch.id}, customer item: ${customerItem.id}`,
    );

  if (
    (customerItem.periodExtends?.length ?? 0) >= extendPeriod.maxNumberOfPeriods
  )
    throw new Error(
      `Customer item does not qualify for extension: ${customerId}, branch: ${branch.id}, customer item: ${customerItem.id}`,
    );

  return {
    type: cartItem.type,
    item: item.id,
    title: item.title,
    delivered: false,
    amount: extendPeriod.price,
    unitPrice: extendPeriod.price,
    taxRate: 0,
    taxAmount: 0,
    info: {
      from: new Date(),
      to: extendPeriod.date,
      numberOfPeriods: 1,
      periodType: extendPeriod.type,
      customerItem: customerItem.id,
    },
  } as const satisfies OrderItem;
}

export const OrderService = {
  async getByCheckoutReferenceOrNull(reference: string) {
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [
      {
        fieldName: "checkout.reference",
        value: reference,
      },
    ];
    const [order] =
      (await StorageService.Orders.getByQueryOrNull(databaseQuery)) ?? [];
    return order ?? null;
  },
  async createCheckoutOrder(
    customerId: string,
    cartItems: BuyoutOrExtendCartItem[],
  ) {
    let total = 0;
    let branch: Branch | null = null;
    const orderItems: OrderItem[] = [];

    for (const cartItem of cartItems) {
      const [item, customerItem] = await Promise.all([
        StorageService.Items.get(cartItem.itemId),
        CustomerItemService.getCustomerItemByItemId({
          customerId,
          itemId: cartItem.itemId,
        }),
      ]);
      if (!customerItem)
        throw new Error("Customer item not found in checkout order generation");
      branch = await StorageService.Branches.get(
        customerItem.handoutInfo?.handoutById,
      );
      if (cartItem.type === "buyout") {
        const orderItem = createBuyoutOrderItem(
          cartItem,
          item,
          customerItem,
          branch,
        );
        total += orderItem.amount;
        orderItems.push(orderItem);
        continue;
      }
      if (cartItem.type === "extend") {
        orderItems.push(
          createExtendOrderItem(
            customerId,
            cartItem,
            item,
            customerItem,
            branch,
          ),
        );
        continue;
      }
      throw new Error("Order item type not supported by checkout");
    }
    if (!branch) throw new Error("No branch for checkout order!");

    return await StorageService.Orders.add({
      amount: total,
      orderItems,
      branch: branch.id,
      customer: customerId,
      placed: false,
      byCustomer: true,
      pendingSignature: false,
    });
  },
};
