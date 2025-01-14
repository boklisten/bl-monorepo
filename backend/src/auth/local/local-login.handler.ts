import { LocalLoginCreator } from "@backend/auth/local/local-login-creator/local-login-creator";
import { HashedPasswordGenerator } from "@backend/auth/local/password/hashed-password-generator";
import { SaltGenerator } from "@backend/auth/local/salt/salt-generator";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { LocalLoginModel } from "@backend/collections/local-login/local-login.model";
import { SeCrypto } from "@backend/crypto/se.crypto";
import { isNullish } from "@backend/helper/typescript-helpers";
import { SEDbQuery } from "@backend/query/se.db-query";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiErrorResponse } from "@shared/blapi-response/blapi-error-response";
import isEmail from "validator/lib/isEmail";

export class LocalLoginHandler {
  private localLoginStorage: BlDocumentStorage<LocalLogin>;
  private _hashedPasswordGenerator: HashedPasswordGenerator;
  private _localLoginCreator: LocalLoginCreator;
  private _seCrypto: SeCrypto;

  constructor(
    localLoginStorage?: BlDocumentStorage<LocalLogin>,
    hashedPasswordGenerator?: HashedPasswordGenerator,
    localLoginCreator?: LocalLoginCreator,
  ) {
    this._seCrypto = new SeCrypto();
    this.localLoginStorage =
      localLoginStorage ?? new BlDocumentStorage(LocalLoginModel);
    this._hashedPasswordGenerator =
      hashedPasswordGenerator ??
      new HashedPasswordGenerator(new SaltGenerator(), this._seCrypto);
    this._localLoginCreator = localLoginCreator ?? new LocalLoginCreator();
  }

  public get(username: string): Promise<LocalLogin> {
    return new Promise((resolve, reject) => {
      if (!username || !isEmail(username))
        return reject(
          new BlError(`username "${username}" is not a valid email`),
        );

      const databaseQuery = new SEDbQuery();
      databaseQuery.stringFilters = [
        { fieldName: "username", value: username },
      ];

      this.localLoginStorage
        .getByQuery(databaseQuery)
        .then((localLogins: LocalLogin[]) => {
          if (localLogins.length !== 1) {
            return reject(
              new BlError(
                'could not get LocalLogin by the provided username "' +
                  username +
                  '"',
              ).store("username", username),
            );
          }

          // @ts-expect-error fixme: auto ignored
          return resolve(localLogins[0]);
        })
        .catch((error: BlError) => {
          return reject(
            new BlError(`could not get localLogin with username "${username}"`)
              .code(702)
              .add(error),
          );
        });
    });
  }

  public async createDefaultLocalLoginIfNoneIsFound(
    username: string,
  ): Promise<boolean> {
    try {
      await this.get(username);
    } catch (error) {
      if (error instanceof BlError && error.getCode() === 702) {
        await this.createDefaultLocalLogin(username);
      } else {
        throw new BlError("could not create default localLogin");
      }
    }

    return true;
  }

  public async createDefaultLocalLogin(username: string): Promise<boolean> {
    let alreadyAddedLocalLogin = null;

    try {
      alreadyAddedLocalLogin = await this.get(username);
    } catch {
      alreadyAddedLocalLogin = null;
    }

    if (alreadyAddedLocalLogin) {
      return true;
    }

    try {
      const randomPassword = this._seCrypto.random();

      const defaultLocalLogin = await this._localLoginCreator.create(
        username,
        randomPassword,
      );
      await this.localLoginStorage.add(defaultLocalLogin);

      return true;
    } catch (error) {
      throw new BlError("could not create default localLogin").store(
        "localLoginCreationError",
        error,
      );
    }
  }

  public setPassword(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (isNullish(password) || password.length < 6) {
        return reject(new BlError("localLogin password to short"));
      }

      this.get(username)
        .then((localLogin: LocalLogin) => {
          this._hashedPasswordGenerator
            .generate(password)
            .then(
              (hashedPasswordAndSalt: {
                hashedPassword: string;
                salt: string;
              }) => {
                localLogin.hashedPassword =
                  hashedPasswordAndSalt.hashedPassword;
                localLogin.salt = hashedPasswordAndSalt.salt;

                this.localLoginStorage
                  .update(localLogin.id, {
                    hashedPassword: hashedPasswordAndSalt.hashedPassword,
                    salt: hashedPasswordAndSalt.salt,
                  })
                  .then(() => {
                    resolve(true);
                  })
                  .catch((updateLocalLoginError) => {
                    reject(
                      new BlError("localLogin could not be updated").add(
                        updateLocalLoginError,
                      ),
                    );
                  });
              },
            )
            .catch((hashPasswordError) => {
              reject(hashPasswordError);
            });
        })
        .catch((getLocalLoginError: BlError) => {
          reject(
            new BlError(`localLogin was not found with username "${username}"`)
              .code(702)
              .add(getLocalLoginError),
          );
        });
    });
  }

  public add(localLogin: LocalLogin): Promise<LocalLogin> {
    return new Promise((resolve, reject) => {
      const blError = new BlError("")
        .className("LocalLoginHandler")
        .methodName("add");
      if (!localLogin.username || localLogin.username.length <= 0)
        return reject(
          blError.msg("username of LocalLogin needs to be provided"),
        );
      if (!localLogin.provider || localLogin.provider.length <= 0)
        return reject(
          blError.msg("provider of LocalLogin needs to be provided"),
        );
      if (!localLogin.providerId || localLogin.providerId.length <= 0)
        return reject(
          blError.msg("providerId of LocalLogin needs to be provided"),
        );
      if (!localLogin.hashedPassword || localLogin.hashedPassword.length <= 0)
        return reject(
          blError.msg("hashedPassword of LocalLogin needs to be provided"),
        );
      if (!localLogin.salt || localLogin.salt.length <= 0)
        return reject(blError.msg("salt of LocalLogin needs to be provided"));
      if (!isEmail(localLogin.username))
        return reject(
          blError.msg(
            'username "' + localLogin.username + '" is not a valid email',
          ),
        );

      this.localLoginStorage
        .add(localLogin)
        .then((localLogin: LocalLogin) => {
          return resolve(localLogin);
        })
        .catch((error: BlapiErrorResponse) => {
          return reject(error);
        });
    });
  }
}
