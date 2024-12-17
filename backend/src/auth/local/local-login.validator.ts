import { BlError } from "@boklisten/bl-model";
import isEmail from "validator/lib/isEmail";

import { LocalLoginCreator } from "@/auth/local/local-login-creator/local-login-creator";
import { LocalLoginHandler } from "@/auth/local/local-login.handler";
import { LocalLoginPasswordValidator } from "@/auth/local/password/local-login-password.validator";
import { UserHandler } from "@/auth/user/user.handler";
import { LocalLogin } from "@/collections/local-login/local-login";
import { User } from "@/collections/user/user";

export class LocalLoginValidator {
  constructor(
    private localLoginHandler: LocalLoginHandler,
    private localLoginPasswordValidator: LocalLoginPasswordValidator,
    private localLoginCreator: LocalLoginCreator,
    private userHandler: UserHandler,
  ) {}

  public validate(
    username: string,
    password: string,
  ): Promise<{ provider: string; providerId: string }> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("LocalLoginValidator")
        .methodName("validate");
      if (!username || !isEmail(username))
        return reject(
          blError.msg('username "' + username + '" is not an email'),
        );
      if (!password || password.length <= 0)
        return reject(blError.msg("password is empty or undefined"));

      this.userHandler
        .valid(username)
        .then(() => {
          this.localLoginHandler.get(username).then(
            (localLogin: LocalLogin) => {
              this.localLoginPasswordValidator
                .validate(password, localLogin.salt, localLogin.hashedPassword)
                .then(
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
                      'could not find the user with username "' +
                        username +
                        '"',
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

  public create(
    username: string,
    password: string,
  ): Promise<{ provider: string; providerId: string }> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("LocalLoginValidator")
        .methodName("create");

      username = username.toString().toLocaleLowerCase();

      this.localLoginHandler.get(username).then(
        () => {
          reject(
            blError
              .msg("username already exists")
              .store("username", username)
              .code(903),
          );
        },
        () => {
          this.localLoginCreator.create(username, password).then(
            (localLogin: LocalLogin) => {
              this.localLoginHandler.add(localLogin).then(
                (addedLocalLogin: LocalLogin) => {
                  this.userHandler
                    .create(
                      username,
                      addedLocalLogin.provider,
                      addedLocalLogin.providerId,
                    )
                    .then(
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
}
