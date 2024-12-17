import { BlapiErrorResponse, BlError } from "@boklisten/bl-model";
import isEmail from "validator/lib/isEmail";

import { LocalLoginCreator } from "@/auth/local/local-login-creator/local-login-creator";
import { HashedPasswordGenerator } from "@/auth/local/password/hashed-password-generator";
import { SaltGenerator } from "@/auth/local/salt/salt-generator";
import { SystemUser } from "@/auth/permission/permission.service";
import { BlCollectionName } from "@/collections/bl-collection";
import { LocalLogin } from "@/collections/local-login/local-login";
import { localLoginSchema } from "@/collections/local-login/local-login.schema";
import { SeCrypto } from "@/crypto/se.crypto";
import { isNullish } from "@/helper/typescript-helpers";
import { SEDbQuery } from "@/query/se.db-query";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

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
    this.localLoginStorage = localLoginStorage
      ? localLoginStorage
      : new BlDocumentStorage(BlCollectionName.LocalLogins, localLoginSchema);
    this._hashedPasswordGenerator = hashedPasswordGenerator
      ? hashedPasswordGenerator
      : new HashedPasswordGenerator(new SaltGenerator(), this._seCrypto);
    this._localLoginCreator = localLoginCreator
      ? localLoginCreator
      : new LocalLoginCreator();
  }

  public get(username: string): Promise<LocalLogin> {
    return new Promise((resolve, reject) => {
      if (!username || !isEmail(username))
        return reject(
          new BlError(`username "${username}" is not a valid email`),
        );

      const dbQuery = new SEDbQuery();
      dbQuery.stringFilters = [{ fieldName: "username", value: username }];

      this.localLoginStorage
        .getByQuery(dbQuery)
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
    } catch (e) {
      if (e instanceof BlError && e.getCode() === 702) {
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
      await this.localLoginStorage.add(defaultLocalLogin, new SystemUser());

      return true;
    } catch (e) {
      throw new BlError("could not create default localLogin").store(
        "localLoginCreationError",
        e,
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
                  .update(
                    localLogin.id,
                    {
                      hashedPassword: hashedPasswordAndSalt.hashedPassword,
                      salt: hashedPasswordAndSalt.salt,
                    },
                    new SystemUser(),
                  )
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
        .add(localLogin, { id: "SYSTEM", permission: "admin" })
        .then((localLogin: LocalLogin) => {
          return resolve(localLogin);
        })
        .catch((error: BlapiErrorResponse) => {
          return reject(error);
        });
    });
  }
}
