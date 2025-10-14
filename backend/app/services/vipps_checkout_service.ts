import string from "@adonisjs/core/helpers/string";
import encryption from "@adonisjs/core/services/encryption";
import { Client } from "@vippsmobilepay/sdk";

import { UserDetail } from "#shared/user-detail";
import env from "#start/env";

export interface VippsOrderLine {
  name: string;
  id: string;
  totalAmount: number;
  totalAmountExcludingTax: number;
  totalTaxAmount: number;
  taxRate: number;
}

const isProduction = env.get("API_ENV") === "production";
const client = Client({
  merchantSerialNumber: isProduction
    ? env.get("VIPPS_MSN")
    : env.get("VIPPS_MT_MSN"),
  subscriptionKey: isProduction
    ? env.get("VIPPS_SUBSCRIPTION_KEY")
    : env.get("VIPPS_MT_SUBSCRIPTION_KEY"),
  useTestMode: !isProduction,
  systemName: "boklisten",
  systemVersion: "1.0.0",
  pluginName: env.get("API_ENV").toLowerCase(),
  pluginVersion: "1.0.0",
});

export const vippsCallbackTokenPurpose = "vipps-callback";

export const VippsCheckoutService = {
  async create({
    amount,
    userDetail,
    orderLines,
  }: {
    amount: number;
    userDetail: UserDetail | null;
    orderLines: VippsOrderLine[];
  }) {
    const checkout = await client.checkout.create(
      isProduction ? env.get("VIPPS_CLIENT_ID") : env.get("VIPPS_MT_CLIENT_ID"),
      isProduction ? env.get("VIPPS_SECRET") : env.get("VIPPS_MT_SECRET"),
      {
        type: "PAYMENT",
        prefillCustomer: userDetail
          ? {
              firstName: userDetail.name.split(" ")[0] ?? null,
              lastName: userDetail.name.split(" ")[1] ?? null,
              email: userDetail.email,
              phoneNumber: `47${userDetail.phone}`,
              streetAddress: userDetail.address ?? null,
              city: userDetail.postCity ?? null,
              postalCode: userDetail.postCode ?? null,
              country: "NO",
            }
          : null,
        merchantInfo: {
          callbackUrl: `https://${env.get("API_ENV") === "production" ? "" : "staging."}api.boklisten.no/checkout/vipps/callback`,
          returnUrl: `${env.get("NEXT_CLIENT_URI")}order-history`,
          callbackAuthorizationToken: encryption.encrypt(
            string.random(32),
            "1 day",
            vippsCallbackTokenPurpose,
          ),
          termsAndConditionsUrl: `${env.get("CLIENT_URI")}info/policies/conditions`,
        },
        transaction: {
          amount: {
            currency: "NOK",
            value: amount,
          },
          paymentDescription: "Din ordre fra Boklisten.no",
          orderSummary: {
            orderLines,
            orderBottomLine: {
              currency: "NOK",
            },
          },
        },
        configuration: {
          showOrderSummary: true,
        },
      },
    );
    if (!checkout.ok) {
      throw new Error(JSON.stringify(checkout.error));
    }
    const { token, checkoutFrontendUrl, pollingUrl } = checkout.data;
    return { token, checkoutFrontendUrl, pollingUrl };
  },
};
