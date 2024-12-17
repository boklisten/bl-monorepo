import { AccessToken } from "@backend/auth/token/access-token/access-token";
import { AccessTokenSecret } from "@backend/auth/token/access-token/access-token.secret";
import { BlError } from "@shared/bl-error/bl-error";
import { verify } from "jsonwebtoken";

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
        verify(accessToken, this.accessTokenSecret.get(), (error, payload) => {
          if (error || payload === undefined)
            return reject(
              new BlError("could not verify jwt")
                .store("accessToken", accessToken)
                .code(910),
            );

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          resolve(payload);
        });
      } catch {
        return reject(new BlError("could not verify accessToken").code(910));
      }
    });
  }
}
