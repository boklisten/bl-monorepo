import { APP_CONFIG } from "@backend/express-config/application-config.js";
import { BlEnv } from "@backend/express-config/env.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import jwt from "jsonwebtoken";
import validator from "validator";

function createPayload(username: string, userid: string) {
  return {
    iss: APP_CONFIG.token.refresh.iss,
    aud: APP_CONFIG.token.refresh.aud,
    iat: Math.floor(Date.now() / 1000),
    sub: userid,
    username: username,
  };
}

function create(username: string, userid: string): Promise<string> {
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
      createPayload(username, userid),
      BlEnv.REFRESH_TOKEN_SECRET,
      { expiresIn: APP_CONFIG.token.refresh.expiresIn },
      (error, refreshToken) => {
        if (error || refreshToken === undefined)
          return reject(blError.msg("could not create refreshToken").code(906));
        resolve(refreshToken);
      },
    );
  });
}

const RefreshTokenCreator = {
  create,
};
export default RefreshTokenCreator;
