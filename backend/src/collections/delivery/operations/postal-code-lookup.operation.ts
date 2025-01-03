import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { isNullish } from "@backend/helper/typescript-helpers";
import { HttpHandler } from "@backend/http/http.handler";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
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
  private httpHandler: HttpHandler;

  constructor(httpHandler?: HttpHandler) {
    this.httpHandler = httpHandler ? httpHandler : new HttpHandler();
  }

  async run(blApiRequest: BlApiRequest): Promise<BlapiResponse> {
    const parsedRequest = PostalCodeLookupSpec.safeParse(blApiRequest.data);
    if (!parsedRequest.success) {
      throw new BlError(fromError(parsedRequest.error).toString()).code(701);
    }
    const bringAuthHeaders = {
      "X-MyBring-API-Key": assertEnv(BlEnvironment.BRING_API_KEY),
      "X-MyBring-API-Uid": assertEnv(BlEnvironment.BRING_API_ID),
    };
    try {
      const response = (await this.httpHandler.getWithQuery(
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
