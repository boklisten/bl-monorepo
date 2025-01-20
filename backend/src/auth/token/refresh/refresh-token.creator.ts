import { TokenConfig } from "@backend/auth/token/token.config.js";
import { assertEnv, BlEnvironment } from "@backend/config/environment.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import jwt from "jsonwebtoken";
import validator from "validator";

export class RefreshTokenCreator {
  constructor(private tokenConfig: TokenConfig) {}

  public create(username: string, userid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("TokenHandler")
        .methodName("createRefreshToken")
        .store("username", username)
        .store("userid", userid);

      if (!username || !validator.isEmail(username))
        return reject(
          blError.msg("username is undefined or not an email").code(103),
        );
      if (!userid || userid.length <= 0)
        return reject(blError.msg("userid is empty or undefined").code(103));

      jwt.sign(
        this.createPayload(username, userid),
        assertEnv(BlEnvironment.REFRESH_TOKEN_SECRET),
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
