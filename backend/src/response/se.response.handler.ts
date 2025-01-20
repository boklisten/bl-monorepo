import { BlErrorHandler } from "@backend/bl-error/bl-error-handler.js";
import { BlEnvironment, assertEnv } from "@backend/config/environment.js";
import { logger } from "@backend/logger/logger.js";
import { BlapiErrorResponse } from "@shared/blapi-response/blapi-error-response.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Response } from "express";

export class SEResponseHandler {
  errorHandler: BlErrorHandler;

  constructor() {
    this.errorHandler = new BlErrorHandler();
  }

  public sendResponse(res: Response, blapiRes: BlapiResponse) {
    logger.silly(`<- 200`);
    res.status(200);
    this.setHeaders(res);
    res.send(blapiRes);
  }

  public sendAuthTokens(
    res: Response,
    accessToken: string,
    refreshToken: string,
    referer?: string,
  ) {
    const redirectUrl = `${
      referer ?? assertEnv(BlEnvironment.CLIENT_URI)
    }auth/token?access_token=${accessToken}&refresh_token=${refreshToken}`;
    res.redirect(redirectUrl);
  }

  public sendErrorResponse(res: Response, blError: unknown) {
    const blapiErrorRes: BlapiErrorResponse =
      this.errorHandler.createBlapiErrorResponse(blError);

    res.status(blapiErrorRes.httpStatus);

    this.setHeaders(res);

    if (blapiErrorRes.httpStatus === 200) {
      logger.verbose(`<- ${blapiErrorRes.httpStatus} ${blapiErrorRes.msg}`);
      this.sendResponse(res, new BlapiResponse(blapiErrorRes.data));
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

  private setHeaders(res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
  }
}
