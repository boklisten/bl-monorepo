import { HttpContext } from "@adonisjs/core/http";
import * as Sentry from "@sentry/node";

import BlErrorHandler from "#services/legacy/bl-error.handler";
import { BlapiErrorResponse } from "#shared/blapi-response/blapi-error-response";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

function createErrorResponse({ response }: HttpContext, blError: unknown) {
  const blapiErrorRes: BlapiErrorResponse =
    BlErrorHandler.createBlapiErrorResponse(blError);

  response.status(blapiErrorRes.httpStatus);
  if (blapiErrorRes.httpStatus === 200) {
    return new BlapiResponse(blapiErrorRes.data);
  }

  // Send unknown errors to Sentry
  if (blapiErrorRes.httpStatus === 500) {
    Sentry.captureException(blError);
  }

  return blapiErrorRes;
}

const BlResponseHandler = {
  createErrorResponse,
};
export default BlResponseHandler;
