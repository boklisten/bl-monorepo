import { HashedPasswordGenerator } from "@backend/auth/local/password/hashed-password-generator";
import { ProviderIdGenerator } from "@backend/auth/local/provider-id/provider-id-generator";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { BlError } from "@shared/bl-error/bl-error";
import isEmail from "validator/lib/isEmail";

export class LocalLoginCreator {
  private _hashedPasswordGenerator: HashedPasswordGenerator;
  private _providerIdGenerator: ProviderIdGenerator;

  constructor(
    private hashedPasswordGenerator?: HashedPasswordGenerator,
    private providerIdGenerator?: ProviderIdGenerator,
  ) {
    this._hashedPasswordGenerator = hashedPasswordGenerator
      ? hashedPasswordGenerator
      : new HashedPasswordGenerator(new SaltGenerator(), new SeCrypto());
    this._providerIdGenerator = providerIdGenerator
      ? providerIdGenerator
      : new ProviderIdGenerator(new SeCrypto());
  }

  public create(username: string, password: string): Promise<LocalLogin> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("LocalLoginCreator")
        .methodName("create");
      if (!username || !isEmail(username))
        return reject(
          blError
            .msg('username "' + username + '" is undefined or not an Email')
            .code(103),
        );
      if (!password || password.length < 6)
        return reject(blError.msg("password is to short or empty").code(103));

      this._hashedPasswordGenerator.generate(password).then(
        (hashedPasswordAndSalt: { hashedPassword: string; salt: string }) => {
          this._providerIdGenerator.generate(username).then(
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
