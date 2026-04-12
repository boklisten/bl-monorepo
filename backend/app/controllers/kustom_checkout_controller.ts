import type { HttpContext } from "@adonisjs/core/http";
import { PermissionService } from "#services/permission_service";
import { initializeCheckoutValidator } from "#validators/checkout_validators";
import { OrderService } from "#services/order_service";
import { StorageService } from "#services/storage_service";
import { KustomCheckoutService } from "#services/kustom/kustom_checkout_service";

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
    return { nextStep: "payment", kustomOrderId: data?.order_id } as const;
  }
  async getSnippet(ctx: HttpContext) {
    const { data } = await KustomCheckoutService.getOrder(ctx.request.param("kustomOrderId"));
    return data?.html_snippet;
  }
}
