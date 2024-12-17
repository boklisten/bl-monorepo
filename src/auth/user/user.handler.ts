import { UserDetail, BlError } from "@boklisten/bl-model";

import { Blid } from "@/auth/blid/blid";
import { LocalLoginHandler } from "@/auth/local/local-login.handler";
import { SystemUser } from "@/auth/permission/permission.service";
import { BlCollectionName } from "@/collections/bl-collection";
import { EmailValidationHelper } from "@/collections/email-validation/helpers/email-validation.helper";
import { User } from "@/collections/user/user";
import { UserSchema } from "@/collections/user/user.schema";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";
import { SEDbQuery } from "@/query/se.db-query";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class UserHandler {
  private blid: Blid;
  private userDetailStorage: BlDocumentStorage<UserDetail>;
  private userStorage: BlDocumentStorage<User>;
  private _emailValidationHelper: EmailValidationHelper;
  private _localLoginHandler: LocalLoginHandler;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    userStorage?: BlDocumentStorage<User>,
    emailValidationHelper?: EmailValidationHelper,
    localLoginHandler?: LocalLoginHandler,
  ) {
    this.blid = new Blid();
    this.userDetailStorage = userDetailStorage
      ? userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._emailValidationHelper = emailValidationHelper
      ? emailValidationHelper
      : new EmailValidationHelper();
    this.userStorage = userStorage
      ? userStorage
      : new BlDocumentStorage(BlCollectionName.Users, UserSchema);
    this._localLoginHandler = localLoginHandler
      ? localLoginHandler
      : new LocalLoginHandler();
  }

  public getByUsername(username: string): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!username)
        return reject(new BlError("username is empty or undefined"));

      const dbQuery = new SEDbQuery();
      dbQuery.stringFilters = [{ fieldName: "username", value: username }];

      this.userStorage.getByQuery(dbQuery).then(
        (docs: User[]) => {
          if (docs.length > 1) {
            this.handleIfMultipleUsersWithSameEmail(docs)
              .then((user: User) => {
                resolve(user);
              })
              .catch(() => {
                reject(
                  new BlError(`could not handle user with multiple entries`),
                );
              });
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(docs[0]);
          }
        },
        (error: BlError) => {
          reject(
            new BlError('could not find user with username "' + username + '"')
              .add(error)
              .code(702),
          );
        },
      );
    });
  }

  private handleIfMultipleUsersWithSameEmail(users: User[]): Promise<User> {
    // 2024 update: there are still occurrences of duplicated users, seems like a timing issue, where if you send simultaneous requests fast, it might create multiple.
    // this bit of code is for some of our very first customers that had more than one user
    // this issue came from multiple logins as it was created a new user for Facbook, Google and local
    // even with the same email

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let selectedUser = null;

    for (const user of users) {
      if (user.primary) {
        selectedUser = user;
      }
    }

    if (selectedUser) {
      return Promise.resolve(selectedUser);
    } else {
      selectedUser = users[0];

      return (
        this.userStorage
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .update(selectedUser, { primary: true }, new SystemUser())
          .then(() => {
            const promiseArr = users.map((user) =>
              this.userStorage.update(
                user.id,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                { movedToPrimary: selectedUser.id },
                new SystemUser(),
              ),
            );

            return Promise.all(promiseArr)
              .then(() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return selectedUser;
              })
              .catch(() => {
                throw new BlError(
                  `user with multiple entries could not update the other entries with invalid`,
                );
              });
          })
          .catch(() => {
            throw new BlError(
              "user with multiple entries could not update one to primary",
            );
          })
      );
    }
  }

  public get(provider: string, providerId: string): Promise<User> {
    const blError = new BlError("")
      .className("userHandler")
      .methodName("exists");

    return new Promise((resolve, reject) => {
      if (!provider || provider.length <= 0)
        reject(blError.msg("provider is empty or undefined"));
      if (!providerId || providerId.length <= 0)
        reject(blError.msg("providerId is empty of undefined"));

      const dbQuery = new SEDbQuery();
      dbQuery.stringFilters = [
        { fieldName: "login.provider", value: provider },
        { fieldName: "login.providerId", value: providerId },
      ];

      this.userStorage
        .getByQuery(dbQuery)
        .then((users: User[]) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          resolve(users[0]);
        })
        .catch((error: BlError) => {
          reject(
            new BlError("an error occured when getting user")
              .store("provider", provider)
              .store("providerId", providerId)
              .add(error),
          );
        });
    });
  }

  public async create(
    username: string,
    provider: string,
    providerId: string,
  ): Promise<User> {
    if (!username || username.length <= 0)
      throw new BlError("username is empty or undefined").code(907);
    if (!provider || provider.length <= 0)
      throw new BlError("provider is empty or undefined").code(907);
    if (!providerId || providerId.length <= 0)
      throw new BlError("providerId is empty or undefined").code(907);

    let userExists: User;
    try {
      userExists = await this.getByUsername(username);
    } catch {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      userExists = null;
    }

    if (userExists) {
      if (provider === "local") {
        throw new BlError(
          `username "${username}" already exists, but trying to create new user with provider "local"`,
        ).code(903);
      } else if (this.isThirdPartyProvider(provider)) {
        // if user already exists and the creation is with google or facebook
        try {
          await this._localLoginHandler.get(username);
        } catch {
          // if localLogin is not found, should create a default one
          await this._localLoginHandler.createDefaultLocalLogin(username);
        }

        return userExists;
      } else {
        throw new BlError(
          `username "${username}" already exists, but could not link it with new provider "${provider}"`,
        );
      }
    }

    try {
      const blid = await this.blid.createUserBlid(provider, providerId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userDetail: any = {
        email: username,
        blid: blid,
        emailConfirmed: this.isThirdPartyProvider(provider), // email is only valid on creation if using Google or Facebook
      };

      if (this.isThirdPartyProvider(provider)) {
        // if the provider is google or facebook, should create a default localLogin
        // this so that when the user tries to login with username or password he can
        // ask for a new password via email

        await this._localLoginHandler.createDefaultLocalLogin(username);
      }

      const addedUserDetail: UserDetail = await this.userDetailStorage.add(
        userDetail,
        { id: blid, permission: "customer" },
      );

      if (!addedUserDetail.emailConfirmed) {
        await this.sendEmailValidationLink(addedUserDetail);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newUser: any = {
        userDetail: addedUserDetail.id,
        permission: "customer",
        blid: blid,
        username: username,
        valid: false,
        login: {
          provider: provider,
          providerId: providerId,
        },
      };

      return await this.userStorage.add(newUser, {
        id: blid,
        permission: newUser.permission,
      });
    } catch (e) {
      const blError = new BlError("user creation failed").code(903);

      if (e instanceof BlError) {
        blError.add(e);
      } else {
        blError.store("UserCreationError", e);
      }

      throw blError;
    }
  }

  private isThirdPartyProvider(provider: string): boolean {
    return (
      provider === "google" || provider === "facebook" || provider === "oauth2"
    );
  }

  private async sendEmailValidationLink(userDetail: UserDetail): Promise<void> {
    await this._emailValidationHelper
      .createAndSendEmailValidationLink(userDetail.id)
      .catch((sendEmailValidationLinkError: BlError) => {
        throw new BlError("could not send out email validation link").add(
          sendEmailValidationLinkError,
        );
      });
  }

  public valid(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getByUsername(username)
        .then((user: User) => {
          if (!user.active) {
            return reject(new BlError("user.active is false").code(913));
          }

          resolve();
        })
        .catch((getUserError: BlError) => {
          reject(getUserError);
        });
    });
  }

  public exists(provider: string, providerId: string): Promise<void> {
    if (!provider || !providerId) {
      return Promise.reject(
        new BlError("provider or providerId is empty or undefinedl"),
      );
    }

    const dbQuery = new SEDbQuery();
    dbQuery.stringFilters = [
      { fieldName: "login.provider", value: provider },
      { fieldName: "login.providerId", value: providerId },
    ];

    return new Promise((resolve, reject) => {
      this.userStorage
        .getByQuery(dbQuery)
        .then(() => {
          resolve();
        })
        .catch((blError: BlError) => {
          reject(new BlError("does not exist").add(blError));
        });
    });
  }
}
