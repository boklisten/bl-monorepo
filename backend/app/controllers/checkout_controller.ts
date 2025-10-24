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
  async initializeCheckout(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    const { cartItems } = await ctx.request.validateUsing(
      initializeCheckoutValidator,
    );
    const order = await OrderService.createFromCart(detailsId, cartItems);

    if (order.amount === 0) {
      const branch = await StorageService.Branches.get(order.branch);
      if (
        !branch.deliveryMethods?.byMail ||
        branch.paymentInfo?.responsibleForDelivery
      ) {
        return { nextStep: "confirm" };
      }
    }

    const { token, checkoutFrontendUrl } =
      await VippsCheckoutService.create(order);
    return { nextStep: "payment", token, checkoutFrontendUrl } as const;
  }

  // TODO: and handle callback with selected postal option + user/billing info
  async handleVippsCallback(ctx: HttpContext) {
    console.log(ctx.request.body());
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
