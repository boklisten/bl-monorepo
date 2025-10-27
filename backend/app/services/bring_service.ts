import env from "#start/env";
import { bringPostalCodeResponseValidator } from "#validators/bring_validators";

const bringAuthHeaders = {
  "X-MyBring-API-Key": env.get("BRING_API_KEY"),
  "X-MyBring-API-Uid": env.get("BRING_API_ID"),
};

export const BringService = {
  async lookupPostalCode(postalCode: string) {
    const bringResponse = await (
      await fetch(
        `https://api.bring.com/address/api/NO/postal-codes/${postalCode}`,
        {
          headers: bringAuthHeaders,
        },
      )
    ).json();
    const [, data] =
      await bringPostalCodeResponseValidator.tryValidate(bringResponse);
    return data?.postal_codes[0]?.city ?? null;
  },
};
