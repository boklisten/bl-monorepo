import type { HttpContext } from "@adonisjs/core/http";
import { PermissionService } from "#services/permission_service";
import { initializeCheckoutValidator } from "#validators/checkout_validators";
import { OrderService } from "#services/order_service";
import { StorageService } from "#services/storage_service";
import { KustomCheckoutService } from "#services/kustom/kustom_checkout_service";
import { APP_CONFIG } from "#services/legacy/application-config";
import { OrderPlacedHandler } from "#services/legacy/collections/order/helpers/order-placed-handler/order-placed-handler";
import { DateTime } from "luxon";

export default class KustomCheckoutController {
  async initializeCheckout(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    const { cartItems } = await ctx.request.validateUsing(initializeCheckoutValidator);
    const order = await OrderService.createFromCart(detailsId, cartItems);
    const branch = await StorageService.Branches.get(order.branch);
    const isDeliveryFree = branch.paymentInfo?.responsibleForDelivery ?? false;
    if (order.amount === 0) {
      if (!branch.deliveryMethods?.byMail || isDeliveryFree) {
        return { nextStep: "confirm", orderId: order.id } as const;
      }
    }
    const { data } = await KustomCheckoutService.createOrder(order, isDeliveryFree);
    await StorageService.Orders.update(order.id, { kustomCheckoutId: data?.order_id });
    return { nextStep: "payment", orderId: order.id } as const;
  }
  async getSnippet(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    let order = await StorageService.Orders.get(ctx.request.param("orderId"));
    if (detailsId !== order.customer)
      throw new Error("You do not have permission to access this payment information");
    if (!order?.kustomCheckoutId)
      throw new Error(`No Kustom checkout ID associated with this order (${order.id})`);

    const { data } = await KustomCheckoutService.getOrder(order.kustomCheckoutId);
    if (data?.status === "checkout_complete" && !order.placed) {
      const userDetail = await StorageService.UserDetails.get(detailsId);
      if (data.billing_address) {
        await StorageService.UserDetails.update(detailsId, {
          name: `${data.billing_address.given_name} ${data.billing_address.family_name}`,
          address: data.billing_address.street_address ?? userDetail.address,
          postCode: data.billing_address.postal_code ?? userDetail.postCode,
          postCity: data.billing_address.city ?? userDetail.postCity,
        });
      }
      let deliveryPrice = 0;
      if (data.selected_shipping_option) {
        deliveryPrice = Math.ceil(data.selected_shipping_option.price / 100);
        const delivery = await StorageService.Deliveries.add({
          method: "bring",
          info: {
            amount: deliveryPrice,
            estimatedDelivery: DateTime.now()
              .plus({ days: APP_CONFIG.delivery.deliveryDays + 2 })
              .toJSDate(),
            taxAmount: deliveryPrice * 0.25,
            facilityAddress: {
              address: "Martin Lingesvei 25",
              postalCode: "1364",
              postalCity: "FORNEBU",
            },
            shipmentAddress: {
              name:
                data.shipping_address?.given_name && data.shipping_address?.family_name
                  ? `${data.shipping_address?.given_name} ${data.shipping_address?.family_name}`
                  : userDetail.name,
              address: data.shipping_address?.street_address ?? userDetail.address,
              postalCode: data.shipping_address?.postal_code ?? userDetail.postCode,
              postalCity: data.shipping_address?.city ?? userDetail.postCity,
            },
            from: "1364",
            to: data.shipping_address?.postal_code ?? userDetail.postCode,
            product:
              data.selected_shipping_option?.shipping_method === "Postal" ? "3584" : "SERVICEPAKKE",
          },
          order: order.id,
          amount: deliveryPrice,
          user: {
            id: userDetail.user?.id ?? "",
            permission: userDetail.user?.permission ?? "customer",
          },
        });
        await StorageService.Orders.update(order.id, {
          delivery: delivery.id,
        });
      }

      const payment = await StorageService.Payments.add({
        method: "kustom-checkout",
        order: order.id,
        amount: order.amount + deliveryPrice,
        customer: order.customer,
        branch: order.branch,
      });

      order = await StorageService.Orders.update(order.id, {
        payments: [...(order.payments ?? []), payment.id],
      });

      await new OrderPlacedHandler().placeOrder(order, order.customer);
    }
    return data?.html_snippet;
  }
  async receivePush(ctx: HttpContext) {
    console.log(ctx.request.body());
  }
}
