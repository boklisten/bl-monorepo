import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

import { BlApiRequest } from "#services/types/bl-api-request";

export interface Operation {
  run(blApiRequest: BlApiRequest): Promise<BlapiResponse>;
}
