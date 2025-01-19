import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { logger } from "@backend/logger/logger";
import cors from "cors";
import { Express, Request, RequestHandler, Response } from "express";
import session from "express-session";
import mongoose from "mongoose";

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

export async function connectToDbAndStartServer(app: Express) {
  mongoose.connection.on("disconnected", () => {
    logger.error("mongoose connection was disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.warn("mongoose connection was reconnected");
  });

  mongoose.connection.on("error", () => {
    logger.error("mongoose connection has error");
  });

  await mongoose.connect(assertEnv(BlEnvironment.MONGODB_URI), {
    maxPoolSize: 10,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });

  app.listen(assertEnv(BlEnvironment.PORT), () => {
    logger.info("ready to take requests!");
  });
}
