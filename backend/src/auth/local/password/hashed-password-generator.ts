import { SaltGenerator } from "@backend/auth/local/salt/salt-generator.js";
import { SeCrypto } from "@backend/crypto/se.crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";

export class HashedPasswordGenerator {
  constructor(
    private saltGenerator: SaltGenerator,
    private seCrypto: SeCrypto,
  ) {}

  public generate(
    password: string,
  ): Promise<{ hashedPassword: string; salt: string }> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("HashedPasswordGenerator")
        .methodName("generate");
      if (!password || password.length < 6)
        reject(blError.msg("password is empty or to short"));

      this.saltGenerator.generate().then(
        (generatedSalt) => {
          this.seCrypto.hash(password, generatedSalt).then(
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
}
