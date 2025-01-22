import UserProvider from "@backend/auth/user/user-provider.js";
import { createPath, retrieveRefererPath } from "@backend/express-config/api-path.js";
import { APP_CONFIG } from "@backend/express-config/application-config.js";
import { BlEnv } from "@backend/express-config/env.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Router } from "express";
import passport from "passport";
import { Profile, Strategy as GoogleStrategy } from "passport-google-oauth20";

function createPassportStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: BlEnv.GOOGLE_CLIENT_ID,
        clientSecret: BlEnv.GOOGLE_SECRET,
        passReqToCallback: true,
        callbackURL: BlEnv.BL_API_URI + createPath("auth/google/callback"),
      },
      async (request, accessToken, refreshToken, profile, done) => {
        const provider = APP_CONFIG.login.google.name;
        const providerId = profile.id;
        const username = retrieveUsername(profile);

        if (!providerId) {
          return done(null, false, new BlError("no providerId").code(902));
        }

        let userAndTokens;

        try {
          userAndTokens = await UserProvider.loginOrCreate(
            username,
            provider,
            providerId,
          );
        } catch {
          return done(
            null,
            undefined,
            new BlError("could not create user").code(902),
          );
        }

        done(null, userAndTokens.tokens);
      },
    ),
  );
}

function retrieveUsername(profile: Profile): string {
  const username = profile.emails?.find((email) => email.verified)?.value;

  if (!username || username.length <= 0) {
    throw new BlError("username not found by google").code(902);
  }

  return username;
}

function createAuthGet(router: Router) {
  router.get(
    createPath("auth/google"),
    passport.authenticate(APP_CONFIG.login.google.name, {
      scope: ["profile", "email"],
    }),
  );
}

function createCallbackGet(router: Router) {
  router.get(createPath("auth/google/callback"), (request, res) => {
    passport.authenticate(
      APP_CONFIG.login.google.name,
      // @ts-expect-error fixme: auto ignored
      (error, tokens, blError: BlError) => {
        if (!tokens && (error || blError)) {
          return res.redirect(
            BlEnv.CLIENT_URI + APP_CONFIG.path.client.auth.socialLoginFailure,
          );
        }

        if (tokens) {
          return BlResponseHandler.sendAuthTokens(
            res,
            tokens.accessToken,
            tokens.refreshToken,
            retrieveRefererPath(request.headers) ?? undefined,
          );
        }
      },
    )(request, res);
  });
}

const GoogleAuth = {
  createRouter: () => {
    const router: Router = Router();
    createAuthGet(router);
    createCallbackGet(router);
    createPassportStrategy();
    return router;
  },
};
export default GoogleAuth;
