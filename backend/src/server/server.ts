import { assertEnv, BlEnvironment } from "@backend/config/environment.js";
import { logger } from "@backend/logger/logger.js";
import cors from "cors";
import { Request, RequestHandler, Response } from "express";
import session from "express-session";

export function getCorsHandler(): RequestHandler {
  return assertEnv(BlEnvironment.API_ENV) === "production"
    ? cors({
        origin: assertEnv(BlEnvironment.URI_WHITELIST).split(" "),
        methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        preflightContinue: true,
        optionsSuccessStatus: 204,
      })
    : cors();
}

export function getSessionHandler(): RequestHandler {
  return session({
    resave: false,
    saveUninitialized: false,
    secret: assertEnv(BlEnvironment.SESSION_SECRET),
    cookie: { secure: assertEnv(BlEnvironment.API_ENV) === "production" },
  });
}

export function getRedirectToHttpsHandler(): RequestHandler {
  return (request, res, next) => {
    if (
      request.headers["x-forwarded-proto"] !== "https" &&
      assertEnv(BlEnvironment.API_ENV) === "production"
    ) {
      res.redirect("https://" + request.hostname + request.url);
    } else {
      next();
    }
  };
}

export function getDebugLoggerHandler(): RequestHandler {
  return (request: Request, res: Response, next: () => void) => {
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
}
