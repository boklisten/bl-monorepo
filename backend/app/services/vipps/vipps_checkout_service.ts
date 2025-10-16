import moment from "moment-timezone";

import { OrderPlacedHandler } from "#services/legacy/collections/order/helpers/order-placed-handler/order-placed-handler";
import { OrderService } from "#services/order_service";
import { StorageService } from "#services/storage_service";
import { TranslationService } from "#services/translation_service";
import { VippsPaymentService } from "#services/vipps/vipps_payment_service";
import { Order } from "#shared/order/order";
import env from "#start/env";

export const VippsCheckoutService = {
  async create(order: Order) {
    const userDetail = await StorageService.UserDetails.get(order.customer);
    const { token, checkoutFrontendUrl, reference } =
      await VippsPaymentService.checkout.create({
        type: "PAYMENT",
        prefillCustomer: {
          firstName: userDetail.name.split(" ")[0] ?? null,
          lastName: userDetail.name.split(" ")[1] ?? null,
          email: userDetail.email,
          phoneNumber: `47${userDetail.phone}`,
          streetAddress: userDetail.address ?? null,
          city: userDetail.postCity ?? null,
          postalCode: userDetail.postCode ?? null,
          country: "NO",
        },
        merchantInfo: {
          callbackUrl: `https://${env.get("API_ENV") === "production" ? "" : "staging."}api.boklisten.no/checkout/vipps/callback`,
          returnUrl: `${env.get("NEXT_CLIENT_URI")}kasse/betaling/status?orderId=${order.id}`,
          callbackAuthorizationToken: VippsPaymentService.token.issue(),
          termsAndConditionsUrl: `${env.get("CLIENT_URI")}info/policies/conditions`,
        },
        transaction: {
          amount: {
            currency: "NOK",
            value: order.amount * 100,
          },
          paymentDescription: `Din ordre fra Boklisten.no #${order.id}`,
          orderSummary: {
            orderLines: order.orderItems.map((orderItem) => {
              const priceInMinors = orderItem.amount * 100;
              return {
                id: orderItem.item,
                name: `${orderItem.title} - ${TranslationService.translateOrderItemTypeImperative(orderItem.type)}${orderItem.info?.to ? moment(orderItem.info?.to).format("DD/MM/YYYY") : ""}`,
                totalAmount: priceInMinors,
                taxRate: 0,
                totalTaxAmount: 0,
                totalAmountExcludingTax: priceInMinors,
              };
            }),
            orderBottomLine: {
              currency: "NOK",
            },
          },
        },
        configuration: {
          elements: "PaymentOnly",
          showOrderSummary: true,
        },
      });
    await StorageService.Orders.update(order.id, {
      checkout: {
        reference,
        state: "SessionCreated",
      },
    });
    return { token, checkoutFrontendUrl };
  },
  async update(reference: string, state: string) {
    let order = await OrderService.getByCheckoutReferenceOrNull(reference);
    if (!order)
      throw new Error(
        "Unknown checkout reference received from Vipps callback",
      );
    order = await StorageService.Orders.update(order.id, {
      checkout: {
        reference,
        state,
      },
    });
    if (state !== "PaymentSuccessful") return;
    const payment = await StorageService.Payments.add({
      method: "vipps-checkout",
      order: order.id,
      amount: order.amount,
      customer: order.customer,
      branch: order.branch,
      taxAmount: 0,
      discount: {
        amount: 0,
      },
    });
    order = await StorageService.Orders.update(order.id, {
      payments: [...(order.payments ?? []), payment.id],
    });
    return await new OrderPlacedHandler().placeOrder(order, order.customer);
  },
};
