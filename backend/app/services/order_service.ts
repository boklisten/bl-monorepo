import { CustomerItemService } from "#services/customer_item_service";
import { OrderItemService } from "#services/order_item_service";
import { StorageService } from "#services/storage_service";
import { CheckoutCartItem } from "#shared/cart_item";
import { OrderItem } from "#shared/order/order-item/order-item";

export const OrderService = {
  async createFromCart(customerId: string, cartItems: CheckoutCartItem[]) {
    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const cartItem of cartItems) {
      const [item, customerItem] = await Promise.all([
        StorageService.Items.get(cartItem.id),
        CustomerItemService.getCustomerItemByItemIdOrNull({
          customerId,
          itemId: cartItem.id,
        }),
      ]);
      let orderItem: OrderItem;
      switch (cartItem.type) {
        case "buyout": {
          if (!customerItem)
            throw new Error("No customer item found for buyout");
          orderItem = await OrderItemService.createBuyoutOrderItem(
            customerItem,
            item,
          );
          break;
        }
        case "extend": {
          if (!customerItem)
            throw new Error("customerItem is required for extensions");
          if (!cartItem.to) throw new Error("to is required for extensions");
          orderItem = await OrderItemService.createExtendOrderItem(
            customerItem,
            item,
            cartItem.to,
          );
          break;
        }
        case "buy": {
          orderItem = OrderItemService.createBuyOrderItem(item);
          break;
        }
        case "partly-payment": {
          if (!cartItem.to) throw new Error("to is required for extensions");
          orderItem = await OrderItemService.createPartlyPaymentOrderItem(
            item,
            cartItem.branchId,
            cartItem.to,
          );
          break;
        }
        case "rent": {
          if (!cartItem.to) throw new Error("to is required for extensions");
          orderItem = await OrderItemService.createRentOrderItem(
            item,
            cartItem.branchId,
            cartItem.to,
          );
          break;
        }
        default:
          throw new Error("Order item type not supported");
      }
      total += orderItem.amount;
      orderItems.push(orderItem);
    }
    const branchId = cartItems[0]?.branchId;
    if (!branchId) throw new Error("No branchId for checkout order");

    return await StorageService.Orders.add({
      amount: total,
      orderItems,
      branch: branchId,
      customer: customerId,
      placed: false,
      byCustomer: true,
      pendingSignature: false,
    });
  },
};
