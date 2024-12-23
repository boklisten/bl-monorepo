import { BlCollectionName } from "@backend/collections/bl-collection";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { localLoginSchema } from "@backend/collections/local-login/local-login.schema";
import { User } from "@backend/collections/user/user";
import { UserSchema } from "@backend/collections/user/user.schema";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";

export class UserDeleteAllInfo {
  private queryBuilder: SEDbQueryBuilder;
  constructor(
    private userStorage?: BlDocumentStorage<User>,
    private localLoginStorage?: BlDocumentStorage<LocalLogin>,
  ) {
    this.userStorage = this.userStorage
      ? this.userStorage
      : new BlDocumentStorage(BlCollectionName.Users, UserSchema);
    this.localLoginStorage = this.localLoginStorage
      ? this.localLoginStorage
      : new BlDocumentStorage(BlCollectionName.LocalLogins, localLoginSchema);
    this.queryBuilder = new SEDbQueryBuilder();
  }

  public async deleteAllInfo(
    userDetailId: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const user = await this.removeUser(userDetailId, accessToken);

    await this.removeLocalLogin(user.username, accessToken);

    return true;
  }

  private async removeUser(
    userDetailId: string,
    accessToken: AccessToken,
  ): Promise<User> {
    const databaseQuery = this.queryBuilder.getDbQuery(
      { userDetail: userDetailId },
      [{ fieldName: "userDetail", type: "object-id" }],
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const users = await this.userStorage.getByQuery(databaseQuery);

    if (users.length > 1) {
      throw new BlError(
        `could not remove user "${userDetailId}": multiple users was found with same username`,
      );
    }

    const user = users[0];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.userStorage.remove(user.id, {
      id: accessToken.details,
      permission: accessToken.permission,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return user;
  }

  private async removeLocalLogin(
    username: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const localLoginDatabaseQuery = this.queryBuilder.getDbQuery(
      { username: username },
      [{ fieldName: "username", type: "string" }],
    );

    const localLogins =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.localLoginStorage.getByQuery(localLoginDatabaseQuery);
    const localLogin = localLogins[0];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.localLoginStorage.remove(localLogin.id, {
      id: accessToken.details,
      permission: accessToken.permission,
    });

    return true;
  }
}
