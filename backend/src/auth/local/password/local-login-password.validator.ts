import { SeCrypto } from "@backend/crypto/se.crypto.js";
import { BlError } from "@shared/bl-error/bl-error.js";

export class LocalLoginPasswordValidator {
  constructor(private seCrypto: SeCrypto) {}

  public validate(
    password: string,
    salt: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("LocalLoginPasswordValidator")
        .methodName("validate");

      if (!password || password.length <= 0)
        reject(blError.msg("password is empty or undefined").code(901));
      if (!salt || salt.length <= 0)
        reject(blError.msg("salt is empty or undefined"));
      if (!hashedPassword || hashedPassword.length <= 0)
        reject(blError.msg("hashedPassword is empty or undefined"));

      this.seCrypto.hash(password, salt).then(
        (passwordAndSaltHashed: string) => {
          if (passwordAndSaltHashed === hashedPassword) {
            resolve(true);
          }

          reject(
            blError
              .msg(
                "password and salt does not hash into the given hashedPassword",
              )
              .code(901),
          );
        },
        (error: BlError) => {
          reject(
            error.add(
              blError
                .msg("could not hash the provided password and salt")
                .code(901),
            ),
          );
        },
      );
    });
  }
}
