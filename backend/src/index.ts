import "@backend/instrument";

import { createAuthEndpoints } from "@backend/auth/auth-endpoint-creator";
import { createCollectionEndpoints } from "@backend/collection-endpoint/collection-endpoint-creator";
import { logger } from "@backend/logger/logger";
import {
  connectToDbAndStartServer,
  getCorsHandler,
  getDebugLoggerHandler,
  getRedirectToHttpsHandler,
  getSessionHandler,
} from "@backend/server/server";
import * as Sentry from "@sentry/node";
import express, { json, Router } from "express";
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
app.use(getCorsHandler());
app.use(getSessionHandler());
app.use(getDebugLoggerHandler());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  // @ts-expect-error fixme: auto ignored
  done(null, user);
});

app.get("*", getRedirectToHttpsHandler());

createAuthEndpoints(router);
createCollectionEndpoints(router);
app.use(router);

Sentry.profiler.startProfiler();
Sentry.setupExpressErrorHandler(app);

connectToDbAndStartServer(app);
