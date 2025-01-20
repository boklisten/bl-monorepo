import { AccessTokenSecret } from "@backend/auth/token/access-token/access-token.secret.js";
import { RefreshTokenValidator } from "@backend/auth/token/refresh/refresh-token.validator.js";
import { TokenConfig } from "@backend/auth/token/token.config.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { UserPermission } from "@shared/permission/user-permission.js";
import jwt from "jsonwebtoken";

export class AccessTokenCreator {
  private refreshTokenValidator: RefreshTokenValidator;
  private accessTokenSecret: AccessTokenSecret;

  constructor(private tokenConfig: TokenConfig) {
    this.refreshTokenValidator = new RefreshTokenValidator();
    this.accessTokenSecret = new AccessTokenSecret();
  }

  public create(
    username: string,
    userid: string,
    permission: UserPermission,
    userDetailId: string,
    refreshToken: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!username || !userid || !refreshToken)
        return reject(
          new BlError("parameter is empty or undefined")
            .className("TokenHandler")
            .methodName("createAccessToken"),
        );

      this.refreshTokenValidator.validate(refreshToken).then(
        () => {
          jwt.sign(
            this.createPayload(username, userid, permission, userDetailId),
            this.accessTokenSecret.get(),
            { expiresIn: this.tokenConfig.accessToken.expiresIn },
            (error, accessToken) => {
              if (error || accessToken === undefined)
                return reject(
                  new BlError("could not sign jwt")
                    .store("usename", username)
                    .store("permission", permission)
                    .code(905),
                );

              return resolve(accessToken);
            },
          );
        },
        (refreshTokenError: BlError) => {
          reject(
            new BlError("refreshToken is not valid")
              .add(refreshTokenError)
              .code(905),
          );
        },
      );
    });
  }

  private createPayload(
    username: string,
    userid: string,
    permission: UserPermission,
    userDetailId: string,
  ) {
    return {
      iss: this.tokenConfig.accessToken.iss,
      aud: this.tokenConfig.accessToken.aud,
      iat: Math.floor(Date.now() / 1000),
      sub: userid,
      username: username,
      permission: permission,
      details: userDetailId,
    };
  }
}
