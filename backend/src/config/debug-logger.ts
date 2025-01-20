import { assertEnv, BlEnvironment } from "@backend/config/environment.js";
import { logger } from "@backend/logger/logger.js";
import { Request, RequestHandler, Response } from "express";

const debugLoggerHandler: RequestHandler = (
  request: Request,
  res: Response,
  next: () => void,
) => {
  if (request.method !== "OPTIONS") {
    // no point in showing all the preflight requests
    logger.debug(`-> ${request.method} ${request.url}`);
    if (
      !(
        request.url.includes("auth") &&
        assertEnv(BlEnvironment.API_ENV) === "production"
      )
    ) {
      let body: string;
      try {
        body = JSON.stringify(request.body);
      } catch {
        body = request.body.toString("utf8");
      }

      logger.silly(`-> ${body}`);
    }
  }
  next();
};

export default debugLoggerHandler;
