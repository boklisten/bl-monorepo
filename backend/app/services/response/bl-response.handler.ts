import { HttpContext } from "@adonisjs/core/http";
import * as Sentry from "@sentry/node";

import BlErrorHandler from "#services/bl-error/bl-error.handler";
import { BlapiErrorResponse } from "#shared/blapi-response/blapi-error-response";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

function sendResponse(ctx: HttpContext, blapiRes: BlapiResponse) {
  ctx.response.status(200);
  ctx.response.send(blapiRes);
}
function createErrorResponse(ctx: HttpContext, blError: unknown) {
  const blapiErrorRes: BlapiErrorResponse =
    BlErrorHandler.createBlapiErrorResponse(blError);

  ctx.response.status(blapiErrorRes.httpStatus);
  if (blapiErrorRes.httpStatus === 200) {
    return new BlapiResponse(blapiErrorRes.data);
  }

  // Send unknown errors to Sentry
  if (blapiErrorRes.httpStatus === 500) {
    Sentry.captureException(blError);
  }

  return blapiErrorRes;
}

function sendErrorResponse(ctx: HttpContext, blError: unknown) {
  ctx.response.send(createErrorResponse(ctx, blError));
}

const BlResponseHandler = {
  sendResponse,
  sendErrorResponse,
  createErrorResponse,
};
export default BlResponseHandler;
