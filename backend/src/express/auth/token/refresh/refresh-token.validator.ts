import { BlEnv } from "@backend/express/config/env.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import jwt from "jsonwebtoken";

function validate(refreshToken: string | undefined): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!refreshToken || refreshToken.length <= 0)
      return reject(new BlError("refreshToken is empty or undefined"));

    try {
      jwt.verify(refreshToken, BlEnv.REFRESH_TOKEN_SECRET, (error, payload) => {
        if (error)
          return reject(new BlError("could not validate token").code(909));
        resolve(payload);
      });
    } catch (error) {
      reject(
        new BlError("could not validate token")
          .store("jwt error", error)
          .code(909),
      );
    }
  });
}

const RefreshTokenValidator = { validate };
export default RefreshTokenValidator;
