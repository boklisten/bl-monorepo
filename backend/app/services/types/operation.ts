import { BlApiRequest } from "#services/types/bl-api-request";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

export interface Operation {
  run(blApiRequest: BlApiRequest): Promise<BlapiResponse>;
}
