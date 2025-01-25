import { AccessToken } from "@shared/token/access-token.js";

import { PermissionService } from "#services/auth/permission.service";
import { SEDbQueryBuilder } from "#services/query/se.db-query-builder";
import { BlStorage } from "#services/storage/bl-storage";

export class UserCanDeleteUserDetail {
  private queryBuilder = new SEDbQueryBuilder();

  public async canDelete(
    userIdToDelete: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const userDetailToDelete = await BlStorage.UserDetails.get(userIdToDelete);

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

    const users = await BlStorage.Users.getByQuery(databaseQuery);
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
