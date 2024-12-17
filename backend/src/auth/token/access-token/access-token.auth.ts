import { APP_CONFIG } from "@backend/application-config";
import { AccessToken } from "@backend/auth/token/access-token/access-token";
import { AccessTokenSecret } from "@backend/auth/token/access-token/access-token.secret";
import { RefreshToken } from "@backend/auth/token/refresh/refresh-token";
import { SEToken } from "@backend/auth/token/se.token";
import { TokenConfig } from "@backend/auth/token/token.config";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";

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
