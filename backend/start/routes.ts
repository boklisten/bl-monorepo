import router from "@adonisjs/core/services/router";
import * as Sentry from "@sentry/node";

import configureMongoose from "#config/database";
import LocalAuth from "#services/auth/local/local.auth";
import TokenEndpoint from "#services/auth/token/token.endpoint";
import CollectionEndpointCreator from "#services/collection-endpoint/collection-endpoint-creator";
import setupPassport from "#services/config/auth";
import env from "#start/env";

const AuthSocialController = () =>
  import("#controllers/auth/social_controller");

/**
 * auth social
 */
router
  .get("/auth/:provider/redirect", [AuthSocialController, "redirect"])
  .as("auth.social.redirect");
router
  .get("/auth/:provider/callback", [AuthSocialController, "callback"])
  .as("auth.social.callback");

setupPassport();
LocalAuth.generateEndpoints();
TokenEndpoint.generateEndpoint();

CollectionEndpointCreator.generateEndpoints();
if (env.get("API_ENV") !== "test") {
  await configureMongoose();
  Sentry.profiler.startProfiler();
}
