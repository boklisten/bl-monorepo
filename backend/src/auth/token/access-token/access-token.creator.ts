import { BlError, UserPermission } from "@boklisten/bl-model";
import { sign } from "jsonwebtoken";

import { AccessTokenSecret } from "@/auth/token/access-token/access-token.secret";
import { RefreshTokenValidator } from "@/auth/token/refresh/refresh-token.validator";
import { TokenConfig } from "@/auth/token/token.config";

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
          sign(
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
