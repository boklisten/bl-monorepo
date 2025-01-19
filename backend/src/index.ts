import "@backend/instrument";

import { initAuthEndpoints } from "@backend/auth/initAuthEndpoints";
import { CollectionEndpointCreator } from "@backend/collection-endpoint/collection-endpoint-creator";
import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { logger } from "@backend/logger/logger";
import {
  connectToDbAndStartServer,
  getCorsHandler,
  getSessionHandler,
} from "@backend/server/server";
import express, { json, Request, Response, Router } from "express";
import passport from "passport";

logger.silly(" _     _             _");
logger.silly("| |__ | | __ _ _ __ (_)");
logger.silly("| '_ \\| |/ _` | '_ \\| |");
logger.silly("| |_) | | (_| | |_) | |");
logger.silly(String.raw`|_.__/|_|\__,_| .__/|_|`);
logger.silly("               |_|");

const app = express();
const router = Router();

app.use(json({ limit: "1mb" }));

process.on("unhandledRejection", (reason, p) => {
  logger.error(
    `unhandled rejection at: ${p}, reason: ${reason}` +
      (reason instanceof Error ? `, stack: ${reason.stack}` : ""),
  );
});

app.use(getCorsHandler());
app.use(getSessionHandler());
app.use(passport.initialize());
app.use(passport.session());

app.get("*", (request, res, next) => {
  if (
    request.headers["x-forwarded-proto"] !== "https" &&
    assertEnv(BlEnvironment.API_ENV) === "production"
  ) {
    res.redirect("https://" + request.hostname + request.url);
  } else {
    next();
  }
});

app.use((request: Request, res: Response, next: () => void) => {
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
});

app.use(router);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // @ts-expect-error fixme: auto ignored
  done(null, user);
});

initAuthEndpoints(router);
new CollectionEndpointCreator(router).create();

connectToDbAndStartServer(app);
