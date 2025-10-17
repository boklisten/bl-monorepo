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
    return await VippsCheckoutService.create({
      order: await OrderService.create(detailsId, cartItems),
      elements: "PaymentOnly",
    });
  }

  async handleVippsCallback(ctx: HttpContext) {
    if (!VippsPaymentService.token.verify(ctx.request.header("Authorization")))
      throw new UnauthorizedException(
        "Authorization header missing or invalid",
      );
    const { reference, sessionState } = await ctx.request.validateUsing(
      vippsCallbackValidator,
    );
    await VippsCheckoutService.update(reference, sessionState);
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
      await VippsCheckoutService.update(orderId, info.sessionState);
      return info.sessionState;
    }

    return order.checkoutState ?? null;
  }
}
