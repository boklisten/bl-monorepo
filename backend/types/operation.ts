import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

export interface Operation {
  run(blApiRequest: BlApiRequest): Promise<BlapiResponse>;
}
