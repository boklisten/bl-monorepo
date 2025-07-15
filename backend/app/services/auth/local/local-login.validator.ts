import LocalLoginCreator from "#services/auth/local/local-login-creator";
import LocalLoginHandler from "#services/auth/local/local-login.handler";
import UserHandler from "#services/auth/user/user.handler";
import BlCrypto from "#services/config/bl-crypto";
import { BlError } from "#shared/bl-error/bl-error";

function create(username: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const blError = new BlError("")
      .className("LocalLoginValidator")
      .methodName("create");

    LocalLoginHandler.get(username).then(
      () => {
        reject(
          blError
            .msg("username already exists")
            .store("username", username)
            .code(903),
        );
      },
      () => {
        LocalLoginCreator.create(username, password).then(
          (localLogin) => {
            LocalLoginHandler.add(localLogin).then(
              () => {
                UserHandler.create(username, "local", BlCrypto.random()).then(
                  () => {
                    resolve();
                  },
                  (createError: BlError) => {
                    reject(
                      createError.add(
                        blError.msg(
                          "could not create user based on the provider,providerId and username provided",
                        ),
                      ),
                    );
                  },
                );
              },
              (addError: BlError) => {
                reject(
                  addError.add(
                    blError.msg("could not insert the localLogin object"),
                  ),
                );
              },
            );
          },
          (localLoginCreateError: BlError) => {
            reject(
              localLoginCreateError.add(
                blError.msg(
                  "could not create LocalLogin object by the provided username and password",
                ),
              ),
            );
          },
        );
      },
    );
  });
}

const LocalLoginValidator = {
  create,
};
export default LocalLoginValidator;
