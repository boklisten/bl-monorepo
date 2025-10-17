import { OrderPlacedHandler } from "#services/legacy/collections/order/helpers/order-placed-handler/order-placed-handler";
import { DateService } from "#services/legacy/date.service";
import { StorageService } from "#services/storage_service";
import { TranslationService } from "#services/translation_service";
import { VippsPaymentService } from "#services/vipps/vipps_payment_service";
import { Order } from "#shared/order/order";
import env from "#start/env";

export const VippsCheckoutService = {
  async create({
    order,
    elements,
  }: {
    order: Order;
    elements: "Full" | "PaymentAndContactInfo" | "PaymentOnly";
  }) {
    const userDetail = await StorageService.UserDetails.get(order.customer);
    const { token, checkoutFrontendUrl } =
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
          reference: order.id,
          amount: {
            currency: "NOK",
            value: order.amount * 100,
          },
          paymentDescription: `${userDetail.name} sin ordre fra Boklisten.no`,
          orderSummary: {
            orderLines: order.orderItems.map((orderItem) => {
              const priceInMinors = orderItem.amount * 100;
              const taxInMinors = orderItem.taxAmount * 100;
              return {
                id: orderItem.item,
                name: `${orderItem.title} - ${TranslationService.translateOrderItemTypeImperative(orderItem.type)} ${orderItem.info?.to ? DateService.format(orderItem.info?.to, "Europe/Oslo", "DD/MM/YYYY") : ""}`,
                totalAmount: priceInMinors,
                taxRate: orderItem.taxRate,
                totalTaxAmount: taxInMinors,
                totalAmountExcludingTax: priceInMinors - taxInMinors,
              };
            }),
            orderBottomLine: {
              currency: "NOK",
            },
          },
        },
        configuration: {
          elements: elements,
          showOrderSummary: true,
        },
      });
    await StorageService.Orders.update(order.id, {
      checkoutState: "SessionCreated",
    });
    return { token, checkoutFrontendUrl };
  },
  async update(orderId: string, newState: string) {
    const order = await StorageService.Orders.get(orderId);
    if (
      order.checkoutState === newState ||
      order.checkoutState === "PaymentSuccessful"
    )
      return;

    await StorageService.Orders.update(order.id, {
      checkoutState: newState,
    });

    if (newState !== "PaymentSuccessful") return;

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

    await new OrderPlacedHandler().placeOrder(
      await StorageService.Orders.update(order.id, {
        payments: [...(order.payments ?? []), payment.id],
      }),
      order.customer,
    );
  },
};
