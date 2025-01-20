import { HashedPasswordGenerator } from "@backend/auth/local/password/hashed-password-generator.js";
import { ProviderIdGenerator } from "@backend/auth/local/provider-id/provider-id-generator.js";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator.js";
import { LocalLogin } from "@backend/collections/local-login/local-login.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import validator from "validator";

export class LocalLoginCreator {
  private hashedPasswordGenerator: HashedPasswordGenerator;
  private providerIdGenerator: ProviderIdGenerator;

  constructor(
    hashedPasswordGenerator?: HashedPasswordGenerator,
    providerIdGenerator?: ProviderIdGenerator,
  ) {
    this.hashedPasswordGenerator =
      hashedPasswordGenerator ??
      new HashedPasswordGenerator(new SaltGenerator());
    this.providerIdGenerator = providerIdGenerator ?? new ProviderIdGenerator();
  }

  public create(username: string, password: string): Promise<LocalLogin> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("LocalLoginCreator")
        .methodName("create");
      if (!username || !validator.isEmail(username))
        return reject(
          blError
            .msg('username "' + username + '" is undefined or not an Email')
            .code(103),
        );
      if (!password || password.length < 6)
        return reject(blError.msg("password is to short or empty").code(103));

      this.hashedPasswordGenerator.generate(password).then(
        (hashedPasswordAndSalt: { hashedPassword: string; salt: string }) => {
          this.providerIdGenerator.generate(username).then(
            (providerId: string) => {
              resolve({
                // @ts-expect-error fixme bad types
                id: undefined,
                username: username,
                hashedPassword: hashedPasswordAndSalt.hashedPassword,
                salt: hashedPasswordAndSalt.salt,
                provider: "local",
                providerId: providerId,
              });
            },
            (providerIdGeneratorError: BlError) => {
              reject(
                blError
                  .msg("could not create providerId")
                  .add(providerIdGeneratorError),
              );
            },
          );
        },
        (hashedPasswordGeneratorError: BlError) => {
          reject(
            blError
              .msg("could not create hashedPassword and salt")
              .add(hashedPasswordGeneratorError),
          );
        },
      );
    });
  }
}
