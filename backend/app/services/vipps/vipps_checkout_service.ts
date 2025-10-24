import { APP_CONFIG } from "#services/legacy/application-config";
import { OrderPlacedHandler } from "#services/legacy/collections/order/helpers/order-placed-handler/order-placed-handler";
import { DateService } from "#services/legacy/date.service";
import { StorageService } from "#services/storage_service";
import { TranslationService } from "#services/translation_service";
import { VippsPaymentService } from "#services/vipps/vipps_payment_service";
import { Order } from "#shared/order/order";
import env from "#start/env";

async function createLogistics(order: Order) {
  const needLogistics = order.orderItems.some(
    (orderItem) =>
      orderItem.type === "rent" ||
      orderItem.type === "partly-payment" ||
      orderItem.type === "buy",
  );
  if (!needLogistics) return null;

  let totalWeightInGrams = 0;
  for (const orderItem of order.orderItems) {
    const item = await StorageService.Items.get(orderItem.item);
    const weightField = Number(item.info.weight);
    totalWeightInGrams += (isNaN(weightField) ? 1 : weightField) * 1000;
  }

  const needPickupPoint =
    Math.ceil(totalWeightInGrams) > APP_CONFIG.delivery.maxWeightLetter;

  const deliveryPrice =
    Math.ceil((totalWeightInGrams / 1000) * 20) + (needPickupPoint ? 150 : 75);

  const branch = await StorageService.Branches.get(order.branch);
  return {
    fixedOptions: [
      ...(order.amount > 0 && branch.deliveryMethods?.branch
        ? [
            {
              id: "pickup",
              amount: {
                value: 0,
                currency: "NOK",
              },
              brand: "OTHER",
              title: "Hent selv på stand",
              description: "Du finner åpningstider på våre informasjonssider",
              priority: 0,
              isDefault: true,
            } as const,
          ]
        : []),
      {
        id: "mail",
        amount: {
          value: deliveryPrice * 100,
          currency: "NOK",
        },
        brand: "POSTEN",
        title: needPickupPoint ? "Pakke til hentested" : "Pakke i postkasse",
        description: `Forventet levering om ${APP_CONFIG.delivery.deliveryDays + 2} dager`,
        type: needPickupPoint ? "PICKUP_POINT" : "MAILBOX",
        priority: 1,
        isDefault: order.amount === 0,
      } as const,
    ],
  };
}

export const VippsCheckoutService = {
  async create(order: Order) {
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
              return {
                id: orderItem.item,
                name: `${orderItem.title} - ${TranslationService.translateOrderItemTypeImperative(orderItem.type)} ${orderItem.info?.to ? DateService.format(orderItem.info?.to, "Europe/Oslo", "DD/MM/YYYY") : ""}`,
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
        logistics: await createLogistics(order),
        configuration: {
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
    });

    await new OrderPlacedHandler().placeOrder(
      await StorageService.Orders.update(order.id, {
        payments: [...(order.payments ?? []), payment.id],
      }),
      order.customer,
    );
  },
};
