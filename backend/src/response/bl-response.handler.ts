import BlErrorHandler from "@backend/bl-error/bl-error.handler.js";
import { BlEnv } from "@backend/config/env.js";
import { logger } from "@backend/config/logger.js";
import { BlapiErrorResponse } from "@shared/blapi-response/blapi-error-response.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Response } from "express";

function setHeaders(res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
}

function sendResponse(res: Response, blapiRes: BlapiResponse) {
  logger.silly(`<- 200`);
  res.status(200);
  setHeaders(res);
  res.send(blapiRes);
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

function sendErrorResponse(res: Response, blError: unknown) {
  const blapiErrorRes: BlapiErrorResponse =
    BlErrorHandler.createBlapiErrorResponse(blError);

  res.status(blapiErrorRes.httpStatus);

  setHeaders(res);

  if (blapiErrorRes.httpStatus === 200) {
    logger.verbose(`<- ${blapiErrorRes.httpStatus} ${blapiErrorRes.msg}`);
    sendResponse(res, new BlapiResponse(blapiErrorRes.data));
    return;
  }

  res.send(blapiErrorRes);
  logger.verbose(`<- ${blapiErrorRes.httpStatus} ${blapiErrorRes.msg}`);

  res.end();

  // Send unknown errors to Sentry
  if (blapiErrorRes.httpStatus === 500) {
    throw blError;
  }
}

const BlResponseHandler = {
  sendResponse,
  sendAuthTokens,
  sendErrorResponse,
};
export default BlResponseHandler;
