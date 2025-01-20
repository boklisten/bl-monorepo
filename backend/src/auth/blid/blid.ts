import { SeCrypto } from "@backend/crypto/se.crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";

export class Blid {
  private seCrypto: SeCrypto;

  constructor() {
    this.seCrypto = new SeCrypto();
  }

  public createUserBlid(provider: string, providerId: string): Promise<string> {
    if (provider.length <= 0 || providerId.length <= 0) {
      return Promise.reject(
        new BlError("provider or providerId can not be empty")
          .className("Blid")
          .methodName("createUserBlid"),
      );
    }

    return new Promise((resolve, reject) => {
      this.seCrypto.cipher(provider + providerId).then(
        (cipher: string) => {
          resolve("u#" + cipher);
        },
        (error: unknown) => {
          reject(
            new BlError("error creating cipher for user_blid")
              .data(error)
              .className("Blid")
              .methodName("createUserBlid"),
          );
        },
      );
    });
  }
}
