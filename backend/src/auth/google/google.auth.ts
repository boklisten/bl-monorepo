import { APP_CONFIG } from "@backend/application-config";
import { UserProvider } from "@backend/auth/user/user-provider/user-provider";
import { ApiPath } from "@backend/config/api-path";
import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlError } from "@shared/bl-error/bl-error";
import { Router } from "express";
import passport from "passport";
import { Profile, Strategy as GoogleStrategy } from "passport-google-oauth20";

export class GoogleAuth {
  private apiPath = new ApiPath();
  private userProvider = new UserProvider();

  constructor(
    private router: Router,
    private resHandler: SEResponseHandler,
  ) {
    this.createAuthGet(router);
    this.createCallbackGet(router);

    this.createPassportStrategy();
  }

  private createPassportStrategy() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: assertEnv(BlEnvironment.GOOGLE_CLIENT_ID),
          clientSecret: assertEnv(BlEnvironment.GOOGLE_SECRET),
          passReqToCallback: true,
          callbackURL:
            assertEnv(BlEnvironment.BL_API_URI) +
            this.apiPath.createPath("auth/google/callback"),
        },
        async (request, accessToken, refreshToken, profile, done) => {
          const provider = APP_CONFIG.login.google.name;
          const providerId = profile.id;
          const username = this.retrieveUsername(profile);

          if (!providerId) {
            return done(null, false, new BlError("no providerId").code(902));
          }

          let userAndTokens;

          try {
            userAndTokens = await this.userProvider.loginOrCreate(
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

  private retrieveUsername(profile: Profile): string {
    const username = profile.emails?.find((email) => email.verified)?.value;

    if (!username || username.length <= 0) {
      throw new BlError("username not found by google").code(902);
    }

    return username;
  }

  private createAuthGet(router: Router) {
    router.get(
      this.apiPath.createPath("auth/google"),
      passport.authenticate(APP_CONFIG.login.google.name, {
        scope: ["profile", "email"],
      }),
    );
  }

  private createCallbackGet(router: Router) {
    router.get(
      this.apiPath.createPath("auth/google/callback"),
      (request, res) => {
        passport.authenticate(
          APP_CONFIG.login.google.name,
          // @ts-expect-error fixme: auto ignored
          (error, tokens, blError: BlError) => {
            const resHandler = new SEResponseHandler();

            if (!tokens && (error || blError)) {
              return res.redirect(
                assertEnv(BlEnvironment.CLIENT_URI) +
                  APP_CONFIG.path.client.auth.socialLoginFailure,
              );
            }

            if (tokens) {
              return resHandler.sendAuthTokens(
                res,
                tokens.accessToken,
                tokens.refreshToken,

                // @ts-expect-error fixme: auto ignored
                this.apiPath.retrieveRefererPath(request.headers),
              );
            }
          },
        )(request, res);
      },
    );
  }
}
