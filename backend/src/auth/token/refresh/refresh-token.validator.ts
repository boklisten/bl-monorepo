import { RefreshTokenSecret } from "@backend/auth/token/refresh/refresh-token.secret.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import jwt from "jsonwebtoken";

export class RefreshTokenValidator {
  private refreshTokenSecret: RefreshTokenSecret;

  constructor() {
    this.refreshTokenSecret = new RefreshTokenSecret();
  }

  public validate(refreshToken: string | undefined): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!refreshToken || refreshToken.length <= 0)
        return reject(new BlError("refreshToken is empty or undefined"));

      try {
        jwt.verify(
          refreshToken,
          this.refreshTokenSecret.get(),
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
}
