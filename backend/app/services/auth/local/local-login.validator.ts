import validator from "validator";

import LocalLoginCreator from "#services/auth/local/local-login-creator";
import LocalLoginPasswordValidator from "#services/auth/local/local-login-password.validator";
import LocalLoginHandler from "#services/auth/local/local-login.handler";
import UserHandler from "#services/auth/user/user.handler";
import { LocalLogin } from "#services/types/local-login";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";

function validate(
  username: string,
  password: string,
): Promise<{ provider: string; providerId: string }> {
  return new Promise((resolve, reject) => {
    const blError = new BlError("")
      .className("LocalLoginValidator")
      .methodName("validate");
    if (!username || !validator.isEmail(username))
      return reject(blError.msg('username "' + username + '" is not an email'));
    if (!password || password.length <= 0)
      return reject(blError.msg("password is empty or undefined"));

    UserHandler.valid(username)
      .then(() => {
        LocalLoginHandler.get(username).then(
          (localLogin: LocalLogin) => {
            LocalLoginPasswordValidator.validate(
              password,
              localLogin.salt,
              localLogin.hashedPassword,
            ).then(
              () => {
                resolve({
                  provider: localLogin.provider,
                  providerId: localLogin.providerId,
                });
              },
              (error: BlError) => {
                reject(
                  error.add(
                    blError
                      .msg("username or password is not correct")
                      .code(908),
                  ),
                );
              },
            );
          },
          (error: BlError) => {
            reject(
              error.add(
                blError
                  .msg(
                    'could not find the user with username "' + username + '"',
                  )
                  .code(702),
              ),
            );
          },
        );
      })
      .catch((userValidError: BlError) => {
        if (userValidError.getCode() === 702) {
          reject(new BlError("user not found").code(702).add(userValidError));
        } else {
          reject(new BlError("user not valid").code(902).add(userValidError));
        }
      });
  });
}

function create(
  username: string,
  password: string,
): Promise<{ provider: string; providerId: string }> {
  return new Promise((resolve, reject) => {
    const blError = new BlError("")
      .className("LocalLoginValidator")
      .methodName("create");

    username = username.toString().toLocaleLowerCase();

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
          (localLogin: LocalLogin) => {
            LocalLoginHandler.add(localLogin).then(
              (addedLocalLogin: LocalLogin) => {
                UserHandler.create(
                  username,
                  addedLocalLogin.provider,
                  addedLocalLogin.providerId,
                ).then(
                  (user: User) => {
                    resolve({
                      provider: user.login.provider,
                      providerId: user.login.providerId,
                    });
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
  validate,
  create,
};
export default LocalLoginValidator;
