import { SEDbQueryBuilder } from "#services/legacy/query/se.db-query-builder";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { AccessToken } from "#shared/access-token";

export class UserCanDeleteUserDetail {
  private queryBuilder = new SEDbQueryBuilder();

  public async canDelete(
    userIdToDelete: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const userDetailToDelete =
      await StorageService.UserDetails.get(userIdToDelete);

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

    const users = await StorageService.Users.getByQuery(databaseQuery);
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
