import "backend/src/server/instrument.mjs";

import { initAuthEndpoints } from "@backend/auth/initAuthEndpoints";
import { CollectionEndpointCreator } from "@backend/collection-endpoint/collection-endpoint-creator";
import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { logger } from "@backend/logger/logger";
import * as Sentry from "@sentry/node";
import cors from "cors";
import express, { Express, json, Request, Response, Router } from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";

export class Server {
  public readonly app: Express = express();
  private readonly router = Router();

  constructor() {
    logger.silly(" _     _             _");
    logger.silly("| |__ | | __ _ _ __ (_)");
    logger.silly("| '_ \\| |/ _` | '_ \\| |");
    logger.silly("| |_) | | (_| | |_) | |");
    logger.silly(String.raw`|_.__/|_|\__,_| .__/|_|`);
    logger.silly("               |_|");

    this.initialServerConfig();
    this.initialPassportConfig();
    initAuthEndpoints(this.router);
    this.generateEndpoints();
    this.connectToDbAndStartServer();
  }

  private async connectToDbAndStartServer() {
    const mongoUri = assertEnv(BlEnvironment.MONGODB_URI);

    mongoose.connection.on("disconnected", () => {
      logger.error("mongoose connection was disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.warn("mongoose connection was reconnected");
    });

    mongoose.connection.on("error", () => {
      logger.error("mongoose connection has error");
    });

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });
    this.serverStart();
  }

  private initialServerConfig() {
    this.app.use(json({ limit: "1mb" }));

    process.on("unhandledRejection", (reason, p) => {
      logger.error(
        `unhandled rejection at: ${p}, reason: ${reason}` +
          (reason instanceof Error ? `, stack: ${reason.stack}` : ""),
      );
    });
    const whitelist = assertEnv(BlEnvironment.URI_WHITELIST).split(" ");
    const allowedMethods = ["GET", "PUT", "PATCH", "POST", "DELETE"];
    const allowedHeaders = [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ];

    this.app.use(
      assertEnv(BlEnvironment.API_ENV) === "production"
        ? cors({
            origin: whitelist,
            methods: allowedMethods,
            allowedHeaders: allowedHeaders,
            preflightContinue: true,
            optionsSuccessStatus: 204,
          })
        : cors(),
    );

    this.app.use(
      session({
        resave: false,
        saveUninitialized: false,
        secret: assertEnv(BlEnvironment.SESSION_SECRET),
        cookie: { secure: assertEnv(BlEnvironment.API_ENV) === "production" },
      }),
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    const debugLogPath = (
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

    this.app.get("*", (request, res, next) => {
      if (
        request.headers["x-forwarded-proto"] !== "https" &&
        assertEnv(BlEnvironment.API_ENV) === "production"
      ) {
        res.redirect("https://" + request.hostname + request.url);
      } else {
        next();
      }
    });

    this.app.use(debugLogPath);
    this.app.use(this.router);
  }

  private generateEndpoints() {
    const collectionEndpointCreator = new CollectionEndpointCreator(
      this.router,
    );
    collectionEndpointCreator.create();
  }

  private initialPassportConfig() {
    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      // @ts-expect-error fixme: auto ignored
      done(null, user);
    });
  }

  private serverStart() {
    Sentry.profiler.startProfiler();
    Sentry.setupExpressErrorHandler(this.app);
    this.app.set("port", assertEnv(BlEnvironment.PORT));
    this.app.listen(this.app.get("port"), () => {
      logger.info("ready to take requests!");
    });
  }
}
