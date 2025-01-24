import BlCrypto from "@backend/lib/config/bl-crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";

function createUserBlid(provider: string, providerId: string): Promise<string> {
  if (provider.length <= 0 || providerId.length <= 0) {
    return Promise.reject(
      new BlError("provider or providerId can not be empty")
        .className("Blid")
        .methodName("createUserBlid"),
    );
  }

  return new Promise((resolve, reject) => {
    BlCrypto.cipher(provider + providerId).then(
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

const Blid = {
  createUserBlid,
};
export default Blid;
