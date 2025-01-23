import { HttpContext } from "@adonisjs/core/http";
import BlErrorHandler from "@backend/express/bl-error/bl-error.handler.js";
import { BlEnv } from "@backend/express/config/env.js";
import { logger } from "@backend/express/config/logger.js";
import * as Sentry from "@sentry/node";
import { BlapiErrorResponse } from "@shared/blapi-response/blapi-error-response.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Response } from "express";

function setHeaders(res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
}

function sendResponseExpress(res: Response, blapiRes: BlapiResponse) {
  logger.silly(`<- 200`);
  res.status(200);
  setHeaders(res);
  res.send(blapiRes);
}
function sendResponse(ctx: HttpContext, blapiRes: BlapiResponse) {
  ctx.response.status(200);
  ctx.response.send(blapiRes);
}

function sendAuthTokens(
  res: Response,
  accessToken: string,
  refreshToken: string,
  referer?: string,
) {
  const redirectUrl = `${
    referer ?? BlEnv.CLIENT_URI
  }auth/token?access_token=${accessToken}&refresh_token=${refreshToken}`;
  res.redirect(redirectUrl);
}

function sendErrorResponseExpress(res: Response, blError: unknown) {
  const blapiErrorRes: BlapiErrorResponse =
    BlErrorHandler.createBlapiErrorResponse(blError);

  res.status(blapiErrorRes.httpStatus);

  setHeaders(res);

  if (blapiErrorRes.httpStatus === 200) {
    logger.verbose(`<- ${blapiErrorRes.httpStatus} ${blapiErrorRes.msg}`);
    sendResponseExpress(res, new BlapiResponse(blapiErrorRes.data));
    return;
  }

  res.send(blapiErrorRes);
  logger.verbose(`<- ${blapiErrorRes.httpStatus} ${blapiErrorRes.msg}`);

  res.end();

  // Send unknown errors to Sentry
  if (blapiErrorRes.httpStatus === 500) {
    Sentry.captureException(blError);
  }
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
  sendResponseExpress,
  sendAuthTokens,
  sendErrorResponse,
  sendErrorResponseExpress,
};
export default BlResponseHandler;
