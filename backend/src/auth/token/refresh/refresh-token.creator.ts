import { BlError } from "@boklisten/bl-model";
import { sign } from "jsonwebtoken";
import isEmail from "validator/lib/isEmail";

import { RefreshTokenSecret } from "@/auth/token/refresh/refresh-token.secret";
import { TokenConfig } from "@/auth/token/token.config";

export class RefreshTokenCreator {
  private refreshTokenSecret: RefreshTokenSecret;

  constructor(private tokenConfig: TokenConfig) {
    this.refreshTokenSecret = new RefreshTokenSecret();
  }

  public create(username: string, userid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("TokenHandler")
        .methodName("createRefreshToken")
        .store("username", username)
        .store("userid", userid);

      if (!username || !isEmail(username))
        return reject(
          blError.msg("username is undefined or not an email").code(103),
        );
      if (!userid || userid.length <= 0)
        return reject(blError.msg("userid is empty or undefined").code(103));

      sign(
        this.createPayload(username, userid),
        this.refreshTokenSecret.get(),
        { expiresIn: this.tokenConfig.refreshToken.expiresIn },
        (error, refreshToken) => {
          if (error || refreshToken === undefined)
            return reject(
              blError.msg("could not create refreshToken").code(906),
            );
          resolve(refreshToken);
        },
      );
    });
  }

  private createPayload(username: string, userid: string) {
    return {
      iss: this.tokenConfig.refreshToken.iss,
      aud: this.tokenConfig.refreshToken.aud,
      iat: Math.floor(Date.now() / 1000),
      sub: userid,
      username: username,
    };
  }
}
