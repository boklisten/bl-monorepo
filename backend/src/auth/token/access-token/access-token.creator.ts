import RefreshTokenValidator from "@backend/auth/token/refresh/refresh-token.validator.js";
import { APP_CONFIG } from "@backend/express-config/application-config.js";
import { BlEnv } from "@backend/express-config/env.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { UserPermission } from "@shared/permission/user-permission.js";
import jwt from "jsonwebtoken";

function createPayload(
  username: string,
  userid: string,
  permission: UserPermission,
  userDetailId: string,
) {
  return {
    iss: APP_CONFIG.token.access.iss,
    aud: APP_CONFIG.token.access.aud,
    iat: Math.floor(Date.now() / 1000),
    sub: userid,
    username: username,
    permission: permission,
    details: userDetailId,
  };
}

function create(
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

    RefreshTokenValidator.validate(refreshToken).then(
      () => {
        jwt.sign(
          createPayload(username, userid, permission, userDetailId),
          BlEnv.ACCESS_TOKEN_SECRET,
          { expiresIn: APP_CONFIG.token.access.expiresIn },
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

const AccessTokenCreator = {
  create,
};
export default AccessTokenCreator;
