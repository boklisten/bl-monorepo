import { HttpContext } from "@adonisjs/core/http";
import * as Sentry from "@sentry/node";

import BlErrorHandler from "#services/bl-error/bl-error.handler";
import { BlapiErrorResponse } from "#shared/blapi-response/blapi-error-response";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";
import env from "#start/env";

function sendResponse(ctx: HttpContext, blapiRes: BlapiResponse) {
  ctx.response.status(200);
  ctx.response.send(blapiRes);
}

function sendAuthTokens(
  ctx: HttpContext,
  accessToken: string,
  refreshToken: string,
  referer?: string,
) {
  const redirectUrl = `${
    referer ?? env.get("CLIENT_URI")
  }auth/token?access_token=${accessToken}&refresh_token=${refreshToken}`;
  ctx.response.redirect(redirectUrl);
}

function sendErrorResponse(ctx: HttpContext, blError: unknown) {
  const blapiErrorRes: BlapiErrorResponse =
    BlErrorHandler.createBlapiErrorResponse(blError);

  ctx.response.status(blapiErrorRes.httpStatus);
  if (blapiErrorRes.httpStatus === 200) {
    sendResponse(ctx, new BlapiResponse(blapiErrorRes.data));
    return;
  }

  ctx.response.send(blapiErrorRes);

  // Send unknown errors to Sentry
  if (blapiErrorRes.httpStatus === 500) {
    Sentry.captureException(blError);
  }
}

const BlResponseHandler = {
  sendResponse,
  sendAuthTokens,
  sendErrorResponse,
};
export default BlResponseHandler;
