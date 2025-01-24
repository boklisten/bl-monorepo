import { BlEnv } from "@backend/lib/config/env.js";
import { isNullish } from "@backend/lib/helper/typescript-helpers.js";
import HttpHandler from "@backend/lib/http/http.handler.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { z } from "zod";
import { fromError } from "zod-validation-error";

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
      "X-MyBring-API-Key": BlEnv.BRING_API_KEY,
      "X-MyBring-API-Uid": BlEnv.BRING_API_ID,
    };
    try {
      const response = (await HttpHandler.getWithQuery(
        `https://api.bring.com/address/api/NO/postal-codes/${parsedRequest.data.postalCode}`,
        "",
        bringAuthHeaders,
      )) as SimplifiedBringPostalCodeResponse;

      if (
        response.validation_errors ||
        isNullish(response.postal_codes) ||
        response.postal_codes.length === 0
      ) {
        return new BlapiResponse([{ postalCity: null }]);
      }

      return new BlapiResponse([{ postalCity: response.postal_codes[0].city }]);
    } catch (error) {
      throw new BlError("failed to lookup postal code").data(error).code(200);
    }
  }
}
