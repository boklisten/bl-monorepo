import { z } from "zod";
import { fromError } from "zod-validation-error";

import { isNullish } from "#services/helper/typescript-helpers";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import env from "#start/env";

interface SimplifiedBringPostalCodeResponse {
  postal_codes?:
    | [
        {
          city: string;
        },
      ]
    | [];
  validation_errors?: [
    {
      code: string;
      description: string;
    },
  ];
}

const PostalCodeLookupSpec = z.object({
  postalCode: z.string().length(4),
});

export class PostalCodeLookupOperation implements Operation {
  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = PostalCodeLookupSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }
    const bringAuthHeaders = {
      "X-MyBring-API-Key": env.get("BRING_API_KEY"),
      "X-MyBring-API-Uid": env.get("BRING_API_ID"),
    };
    try {
      const response = await fetch(
        `https://api.bring.com/address/api/NO/postal-codes/${parsedRequest.data.postalCode}`,
        {
          headers: bringAuthHeaders,
        },
      );
      const data = (await response.json()) as SimplifiedBringPostalCodeResponse;

      if (
        data.validation_errors ||
        isNullish(data.postal_codes) ||
        data.postal_codes.length === 0
      ) {
        return new BlapiResponse([{ postalCity: null }]);
      }

      return new BlapiResponse([{ postalCity: data.postal_codes[0].city }]);
    } catch (error) {
      throw new BlError("failed to lookup postal code").data(error).code(200);
    }
  }
}
