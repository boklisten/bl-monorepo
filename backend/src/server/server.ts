import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { logger } from "@backend/logger/logger";
import * as Sentry from "@sentry/node";
import cors from "cors";
import { Express, RequestHandler } from "express";
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

  if (assertEnv(BlEnvironment.API_ENV) === "production") {
    Sentry.profiler.startProfiler();
    Sentry.setupExpressErrorHandler(app);
  }

  app.set("port", assertEnv(BlEnvironment.PORT));
  app.listen(app.get("port"), () => {
    logger.info("ready to take requests!");
  });
}
