import("#services/config/instrument");

import router from "@adonisjs/core/services/router";
import * as Sentry from "@sentry/node";

import configureMongoose from "#config/database";
import LocalAuth from "#services/auth/local/local.auth";
import TokenEndpoint from "#services/auth/token/token.endpoint";
import UserProvider from "#services/auth/user/user-provider";
import CollectionEndpointCreator from "#services/collection-endpoint/collection-endpoint-creator";
import { retrieveRefererPath } from "#services/config/api-path";
import { APP_CONFIG } from "#services/config/application-config";
import setupPassport from "#services/config/auth";
import { BlEnv } from "#services/config/env";

router.get("/auth/facebook", ({ ally }) => {
  return ally.use("facebook").redirect();
});
router.get("/auth/facebook/callback", async ({ ally, request, response }) => {
  const fb = ally.use("facebook");
  if (fb.accessDenied()) {
    return "You have cancelled the login process";
  }
  if (fb.stateMisMatch()) {
    return "We are unable to verify the request. Please try again";
  }

  if (fb.hasError()) {
    return fb.getError();
  }

  const user = await fb.user();
  const provider = APP_CONFIG.login.facebook.name;

  const userAndTokens = await UserProvider.loginOrCreate(
    user.email,
    provider,
    user.id,
  );
  const redirectUrl = `${
    retrieveRefererPath(request.headers()) ?? BlEnv.CLIENT_URI
  }auth/token?access_token=${userAndTokens.tokens.accessToken}&refresh_token=${userAndTokens.tokens.refreshToken}`;
  return response.redirect(redirectUrl);
});

router.get("/auth/google", ({ ally }) => {
  return ally.use("google").redirect();
});
router.get("/auth/google/callback", async ({ ally, request, response }) => {
  const google = ally.use("google");
  if (google.accessDenied()) {
    return "You have cancelled the login process";
  }
  if (google.stateMisMatch()) {
    return "We are unable to verify the request. Please try again";
  }

  if (google.hasError()) {
    return google.getError();
  }

  const user = await google.user();
  const provider = APP_CONFIG.login.google.name;

  const userAndTokens = await UserProvider.loginOrCreate(
    user.email,
    provider,
    user.id,
  );
  const redirectUrl = `${
    retrieveRefererPath(request.headers()) ?? BlEnv.CLIENT_URI
  }auth/token?access_token=${userAndTokens.tokens.accessToken}&refresh_token=${userAndTokens.tokens.refreshToken}`;
  return response.redirect(redirectUrl);
});

setupPassport();
LocalAuth.generateEndpoints();
TokenEndpoint.generateEndpoint();

CollectionEndpointCreator.generateEndpoints();
if (BlEnv.API_ENV !== "test") {
  await configureMongoose();
  Sentry.profiler.startProfiler();
}
