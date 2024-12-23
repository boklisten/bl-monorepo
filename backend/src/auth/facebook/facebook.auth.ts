import { APP_CONFIG } from "@backend/application-config";
import { UserProvider } from "@backend/auth/user/user-provider/user-provider";
import { ApiPath } from "@backend/config/api-path";
import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlError } from "@shared/bl-error/bl-error";
import { Router } from "express";
import passport from "passport";
import { Profile, Strategy, StrategyOptions } from "passport-facebook";

export class FacebookAuth {
  private apiPath: ApiPath;
  private _userProvider: UserProvider;
  private readonly facebookPassportStrategySettings: StrategyOptions;

  constructor(
    private router: Router,
    private resHandler: SEResponseHandler,
  ) {
    this.apiPath = new ApiPath();

    this.facebookPassportStrategySettings = {
      clientID: assertEnv(BlEnvironment.FACEBOOK_CLIENT_ID),
      clientSecret: assertEnv(BlEnvironment.FACEBOOK_SECRET),
      callbackURL:
        assertEnv(BlEnvironment.BL_API_URI) +
        this.apiPath.createPath("auth/facebook/callback"),
      profileFields: ["id", "email", "name"],
      enableProof: true,
    };

    this.createAuthGet(router);
    this.createCallbackGet(router);
    this.createPassportStrategy();
    this._userProvider = new UserProvider();
  }

  private createPassportStrategy() {
    passport.use(
      new Strategy(
        this.facebookPassportStrategySettings,
        async (accessToken, refreshToken, profile, done) => {
          const provider = APP_CONFIG.login.facebook.name;
          const providerId = profile.id;

          let userAndTokens;

          try {
            const username = this.extractUsername(profile);
            userAndTokens = await this._userProvider.loginOrCreate(
              username,
              provider,
              providerId,
            );
          } catch {
            return done(
              null,
              null,
              new BlError("could not create user").code(902),
            );
          }
          done(null, userAndTokens.tokens);
        },
      ),
    );
  }

  private extractUsername(profile: Profile): string {
    let username;

    if (profile.emails && profile.emails[0] && profile.emails[0].value) {
      username = profile.emails[0].value;
    }

    if (!username) {
      throw new BlError("username not found from facebook").code(902);
    }

    return username;
  }

  private createAuthGet(router: Router) {
    router.get(
      this.apiPath.createPath("auth/facebook"),
      passport.authenticate(APP_CONFIG.login.facebook.name, {
        scope: ["public_profile", "email"],
      }),
    );
  }

  private createCallbackGet(router: Router) {
    router.get(
      this.apiPath.createPath("auth/facebook/callback"),
      (request, res) => {
        passport.authenticate(
          APP_CONFIG.login.facebook.name, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (error, tokens, blError: BlError) => {
            if (!tokens && (error || blError)) {
              return res.redirect(
                assertEnv(BlEnvironment.CLIENT_URI) +
                  APP_CONFIG.path.client.auth.socialLoginFailure,
              );
            }

            if (tokens) {
              this.resHandler.sendAuthTokens(
                res,
                tokens.accessToken,
                tokens.refreshToken,
                this.apiPath.retrieveRefererPath(request.headers) ?? undefined,
              );
            }
          },
        )(request, res);
      },
    );
  }
}
