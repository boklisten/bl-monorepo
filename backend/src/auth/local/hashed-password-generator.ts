import SaltGenerator from "@backend/auth/local/salt-generator.js";
import BlCrypto from "@backend/config/bl-crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";

function generate(
  password: string,
): Promise<{ hashedPassword: string; salt: string }> {
  return new Promise((resolve, reject) => {
    const blError = new BlError("")
      .className("HashedPasswordGenerator")
      .methodName("generate");
    if (!password || password.length < 6)
      reject(blError.msg("password is empty or to short"));

    SaltGenerator.generate().then(
      (generatedSalt) => {
        BlCrypto.hash(password, generatedSalt).then(
          (hash) => {
            resolve({ hashedPassword: hash, salt: generatedSalt });
          },
          (error: BlError) => {
            reject(
              error.add(
                blError
                  .msg("could not hash the provided password and salt")
                  .store("salt", generatedSalt),
              ),
            );
          },
        );
      },
      (error: BlError) => {
        reject(error.add(blError.msg("could not generate salt")));
      },
    );
  });
}
const HashedPasswordGenerator = {
  generate,
};

export default HashedPasswordGenerator;
