import { PermissionService } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { User } from "@backend/collections/user/user";
import { userSchema } from "@backend/collections/user/userSchema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class UserCanDeleteUserDetail {
  private queryBuilder: SEDbQueryBuilder;
  private userDetailStorage: BlDocumentStorage<UserDetail>;
  private userStorage: BlDocumentStorage<User>;
  constructor(
    _userDetailStorage?: BlDocumentStorage<UserDetail>,
    _userStorage?: BlDocumentStorage<User>,
  ) {
    this.userDetailStorage =
      _userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this.userStorage =
      _userStorage ?? new BlDocumentStorage(BlCollectionName.Users, userSchema);
    this.queryBuilder = new SEDbQueryBuilder();
  }

  public async canDelete(
    userIdToDelete: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const userDetailToDelete = await this.userDetailStorage.get(userIdToDelete);

    if (userDetailToDelete.id === accessToken.details) {
      return true;
    }

    if (!PermissionService.isAdmin(accessToken.permission)) {
      return false;
    }

    const databaseQuery = this.queryBuilder.getDbQuery(
      { username: userDetailToDelete.email },
      [{ fieldName: "username", type: "string" }],
    );

    const users = await this.userStorage.getByQuery(databaseQuery);
    const userToDelete = users[0];

    return !(
      !PermissionService.isPermissionEqualOrOver(
        accessToken.permission,

        // @ts-expect-error fixme: auto ignored
        userToDelete.permission,

        // @ts-expect-error fixme: auto ignored
      ) || accessToken.permission === userToDelete.permission
    );
  }
}
