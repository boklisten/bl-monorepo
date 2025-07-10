import validator from "validator";

import HashedPasswordGenerator from "#services/auth/local/hashed-password-generator";
import ProviderIdGenerator from "#services/auth/local/provider-id-generator";
import { LocalLogin } from "#services/types/local-login";
import { BlError } from "#shared/bl-error/bl-error";

function create(
  username: string,
  password: string,
): Promise<Omit<LocalLogin, "id">> {
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

    HashedPasswordGenerator.generate(password).then(
      (hashedPasswordAndSalt: { hashedPassword: string; salt: string }) => {
        ProviderIdGenerator.generate(username).then(
          () => {
            resolve({
              username: username,
              hashedPassword: hashedPasswordAndSalt.hashedPassword,
              salt: hashedPasswordAndSalt.salt,
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

const LocalLoginCreator = {
  create,
};

export default LocalLoginCreator;
