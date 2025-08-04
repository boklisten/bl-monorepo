import { BlapiResponse } from "#shared/blapi-response";
import { BlApiRequest } from "#types/bl-api-request";

export interface Operation {
  run(blApiRequest: BlApiRequest): Promise<BlapiResponse>;
}
