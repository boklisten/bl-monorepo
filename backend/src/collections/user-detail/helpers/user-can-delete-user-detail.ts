import { PermissionService } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { User } from "@backend/collections/user/user";
import { UserSchema } from "@backend/collections/user/user.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class UserCanDeleteUserDetail {
  private queryBuilder: SEDbQueryBuilder;
  private permissionService: PermissionService;
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
      _userStorage ?? new BlDocumentStorage(BlCollectionName.Users, UserSchema);
    this.queryBuilder = new SEDbQueryBuilder();
    this.permissionService = new PermissionService();
  }

  public async canDelete(
    userIdToDelete: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const userDetailToDelete = await this.userDetailStorage.get(userIdToDelete);

    if (userDetailToDelete.id === accessToken.details) {
      return true;
    }

    if (!this.permissionService.isAdmin(accessToken.permission)) {
      return false;
    }

    const databaseQuery = this.queryBuilder.getDbQuery(
      { username: userDetailToDelete.email },
      [{ fieldName: "username", type: "string" }],
    );

    const users = await this.userStorage.getByQuery(databaseQuery);
    const userToDelete = users[0];

    return !(
      !this.permissionService.isPermissionEqualOrOver(
        accessToken.permission,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        userToDelete.permission,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      ) || accessToken.permission === userToDelete.permission
    );
  }
}
