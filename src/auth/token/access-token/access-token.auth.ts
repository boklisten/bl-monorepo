import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { APP_CONFIG } from "@/application-config";
import { AccessToken } from "@/auth/token/access-token/access-token";
import { AccessTokenSecret } from "@/auth/token/access-token/access-token.secret";
import { RefreshToken } from "@/auth/token/refresh/refresh-token";
import { SEToken } from "@/auth/token/se.token";
import { TokenConfig } from "@/auth/token/token.config";

export class AccessTokenAuth {
  private accessTokenSecret: AccessTokenSecret;
  private tokenConfig: TokenConfig;

  constructor() {
    new SEToken();
    this.accessTokenSecret = new AccessTokenSecret();
    this.tokenConfig = new TokenConfig(
      APP_CONFIG.token.access as AccessToken,
      APP_CONFIG.token.refresh as RefreshToken,
    );

    passport.use(
      new Strategy(this.getOptions(), (accessToken, done) => {
        done(null, { accessToken });
      }),
    );
  }

  private getOptions() {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.accessTokenSecret.get(),
      issuer: this.tokenConfig.accessToken.iss,
      audience: this.tokenConfig.accessToken.aud,
    };
  }
}
