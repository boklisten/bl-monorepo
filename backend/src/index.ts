import "@backend/express-config/instrument.js";
import FacebookAuth from "@backend/auth/external/facebook.auth.js";
import GoogleAuth from "@backend/auth/external/google.auth.js";
import LocalAuth from "@backend/auth/local/local.auth.js";
import TokenEndpoint from "@backend/auth/token/token.endpoint.js";
import CollectionEndpointCreator from "@backend/collection-endpoint/collection-endpoint-creator.js";
import configurePassport from "@backend/express-config/auth.js";
import corsHandler from "@backend/express-config/cors.js";
import configureMongoose from "@backend/express-config/database.js";
import debugLoggerHandler from "@backend/express-config/debug-logger.js";
import { BlEnv } from "@backend/express-config/env.js";
import redirectToHttpsHandler from "@backend/express-config/https.js";
import { logger } from "@backend/express-config/logger.js";
import sessionHandler from "@backend/express-config/session.js";
import * as Sentry from "@sentry/node";
import express, { json } from "express";
import expressListEndpoints from "express-list-endpoints";
import passport from "passport";

logger.silly(" _     _             _");
logger.silly("| |__ | | __ _ _ __ (_)");
logger.silly("| '_ \\| |/ _` | '_ \\| |");
logger.silly("| |_) | | (_| | |_) | |");
logger.silly(String.raw`|_.__/|_|\__,_| .__/|_|`);
logger.silly("               |_|");

const app = express();
app.use(json({ limit: "1mb" }));
app.use(corsHandler);
app.use(sessionHandler);
app.use(debugLoggerHandler);
app.get("*", redirectToHttpsHandler);

app.use(passport.initialize());
app.use(passport.session());
configurePassport();

app.use(GoogleAuth.createRouter());
app.use(FacebookAuth.createRouter());
app.use(LocalAuth.createRouter());
app.use(TokenEndpoint.createRouter());
app.use(CollectionEndpointCreator.createRouter());

logger.silly(
  expressListEndpoints(app)
    .map((endpoint) =>
      endpoint.methods
        .map((method) => `${method}\t${endpoint.path}`)
        .join("\n"),
    )
    .join("\n"),
);

await configureMongoose();

Sentry.profiler.startProfiler();
Sentry.setupExpressErrorHandler(app);

app.listen(BlEnv.PORT, () => {
  logger.info("ready to take requests!");
});
