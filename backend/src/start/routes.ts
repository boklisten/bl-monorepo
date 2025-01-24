/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from "@adonisjs/core/services/router";
import configureMongoose from "@backend/config/database.js";
import LocalAuth from "@backend/lib/auth/local/local.auth.js";
import TokenEndpoint from "@backend/lib/auth/token/token.endpoint.js";
import UserProvider from "@backend/lib/auth/user/user-provider.js";
import CollectionEndpointCreator from "@backend/lib/collection-endpoint/collection-endpoint-creator.js";
import { retrieveRefererPath } from "@backend/lib/config/api-path.js";
import { APP_CONFIG } from "@backend/lib/config/application-config.js";
import setupPassport from "@backend/lib/config/auth.js";
import { BlEnv } from "@backend/lib/config/env.js";

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
}
