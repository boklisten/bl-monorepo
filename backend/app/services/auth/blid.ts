import BlCrypto from "#services/config/bl-crypto";
import { BlError } from "#shared/bl-error/bl-error";

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
