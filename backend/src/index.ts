import "@backend/config/instrument.js";

import { createAuthEndpoints } from "@backend/auth/auth-endpoint-creator.js";
import { createCollectionEndpoints } from "@backend/collection-endpoint/collection-endpoint-creator.js";
import corsHandler from "@backend/config/cors.js";
import debugLoggerHandler from "@backend/config/debug-logger.js";
import { BlEnv } from "@backend/config/env.js";
import redirectToHttpsHandler from "@backend/config/https.js";
import { logger } from "@backend/config/logger.js";
import sessionHandler from "@backend/config/session.js";
import * as Sentry from "@sentry/node";
import express, { json, Router } from "express";
import mongoose from "mongoose";
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
app.use(corsHandler);
app.use(sessionHandler);
app.use(debugLoggerHandler);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  // @ts-expect-error fixme: auto ignored
  done(null, user);
});

app.get("*", redirectToHttpsHandler);

createAuthEndpoints(router);
createCollectionEndpoints(router);
app.use(router);

mongoose.connection.on("disconnected", () => {
  logger.error("mongoose connection was disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.warn("mongoose connection was reconnected");
});

mongoose.connection.on("error", () => {
  logger.error("mongoose connection has error");
});

await mongoose.connect(BlEnv.MONGODB_URI, {
  maxPoolSize: 10,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
});

Sentry.profiler.startProfiler();
Sentry.setupExpressErrorHandler(app);

app.listen(BlEnv.PORT, () => {
  logger.info("ready to take requests!");
});
