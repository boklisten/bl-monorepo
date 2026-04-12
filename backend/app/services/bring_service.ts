import env from "#start/env";
import {
  bringPostalCodeResponseValidator,
  bringShippingInfoResponseValidator,
} from "#validators/bring_validators";
import { DateTime } from "luxon";
import { APP_CONFIG } from "#services/legacy/application-config";

const bringAuthHeaders = {
  "X-MyBring-API-Key": env.get("BRING_API_KEY"),
  "X-MyBring-API-Uid": env.get("BRING_API_ID"),
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const BringService = {
  async lookupPostalCode(postalCode: string) {
    const bringResponse = await (
      await fetch(`https://api.bring.com/address/api/NO/postal-codes/${postalCode}`, {
        headers: bringAuthHeaders,
      })
    ).json();
    const [, data] = await bringPostalCodeResponseValidator.tryValidate(bringResponse);
    return data?.postal_codes[0]?.city ?? null;
  },
  async getShippingInfo({
    toPostalCode,
    weightInGrams,
  }: {
    toPostalCode: string;
    weightInGrams: number;
  }) {
    const expectedShippingDate = DateTime.now().plus({ days: APP_CONFIG.delivery.deliveryDays });
    const response = await fetch("https://api.bring.com/shippingguide/v2/products", {
      method: "POST",
      headers: bringAuthHeaders,
      body: JSON.stringify({
        withPrice: true,
        withExpectedDelivery: true,
        withGuiInformation: true,
        consignments: [
          {
            products: [
              {
                id: weightInGrams < 5000 ? "3584" : "5800",
              },
            ],
            shippingDate: {
              day: expectedShippingDate.day,
              month: expectedShippingDate.month,
              year: expectedShippingDate.year,
            },
            packages: [
              {
                grossWeight: weightInGrams,
              },
            ],
            fromCountryCode: "NO",
            fromPostalCode: "1364",
            toCountryCode: "NO",
            toPostalCode,
          },
        ],
      }),
    });
    const json = await response.json();
    const [, data] = await bringShippingInfoResponseValidator.tryValidate(json);
    return data?.consignments[0]?.products[0];
  },
};
