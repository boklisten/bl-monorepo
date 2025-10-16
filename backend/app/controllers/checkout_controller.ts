import type { HttpContext } from "@adonisjs/core/http";

import UnauthorizedException from "#exceptions/unauthorized_exception";
import { OrderService } from "#services/order_service";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { VippsCheckoutService } from "#services/vipps/vipps_checkout_service";
import { VippsPaymentService } from "#services/vipps/vipps_payment_service";
import {
  initializeCheckoutValidator,
  vippsCallbackValidator,
} from "#validators/checkout_validators";

export default class CheckoutController {
  // Currently only supporting extend and buyout
  async initializeCheckout(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    const { cartItems } = await ctx.request.validateUsing(
      initializeCheckoutValidator,
    );
    return await VippsCheckoutService.create(
      await OrderService.createCheckoutOrder(detailsId, cartItems),
    );
  }

  async handleVippsCallback(ctx: HttpContext) {
    if (!VippsPaymentService.token.verify(ctx.request.header("Authorization")))
      throw new UnauthorizedException(
        "Authorization header missing or invalid",
      );
    const { reference, sessionState } = await ctx.request.validateUsing(
      vippsCallbackValidator,
    );
    const order = await OrderService.getByCheckoutReferenceOrNull(reference);
    if (!order)
      throw new Error("Order not found by reference in Vipps callback");

    await VippsCheckoutService.update(order, sessionState);
  }

  async pollPayment(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    const orderId = ctx.request.param("orderId");
    const order = await StorageService.Orders.get(orderId);
    if (detailsId !== order.customer)
      throw new Error(
        "You do not have permission to access this payment information",
      );

    if (
      order.checkoutState === "SessionCreated" ||
      order.checkoutState === "PaymentInitiated"
    ) {
      const info = await VippsPaymentService.checkout.info(order.id);
      // Important to get fresh order here to avoid duplicate updates
      const freshOrder = await StorageService.Orders.get(orderId);
      await VippsCheckoutService.update(freshOrder, info.sessionState);
      return info.sessionState;
    }

    return order.checkoutState ?? null;
  }
}
