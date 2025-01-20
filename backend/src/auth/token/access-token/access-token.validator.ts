import { AccessToken } from "@backend/auth/token/access-token/access-token.js";
import { AccessTokenSecret } from "@backend/auth/token/access-token/access-token.secret.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import jwt from "jsonwebtoken";

export class AccessTokenValidator {
  private accessTokenSecret: AccessTokenSecret;

  constructor() {
    this.accessTokenSecret = new AccessTokenSecret();
  }

  public validate(accessToken: string | undefined): Promise<AccessToken> {
    return new Promise((resolve, reject) => {
      if (!accessToken)
        return reject(new BlError("accessToken is empty or undefined"));

      try {
        jwt.verify(
          accessToken,
          this.accessTokenSecret.get(),
          (error, payload) => {
            if (error || payload === undefined)
              return reject(
                new BlError("could not verify jwt")
                  .store("accessToken", accessToken)
                  .code(910),
              );

            // @ts-expect-error fixme: auto ignored
            resolve(payload);
          },
        );
      } catch {
        return reject(new BlError("could not verify accessToken").code(910));
      }
    });
  }
}
