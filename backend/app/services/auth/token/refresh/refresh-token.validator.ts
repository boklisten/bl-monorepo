import jwt from "jsonwebtoken";

import { BlError } from "#shared/bl-error/bl-error";
import env from "#start/env";

function validate(refreshToken: string) {
  return new Promise((resolve, reject) => {
    try {
      jwt.verify(
        refreshToken,
        env.get("REFRESH_TOKEN_SECRET"),
        (error, payload) => {
          if (error)
            return reject(new BlError("could not validate token").code(909));
          resolve(payload);
        },
      );
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
