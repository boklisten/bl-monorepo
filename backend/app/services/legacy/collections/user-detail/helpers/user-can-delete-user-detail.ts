import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { UserService } from "#services/user_service";
import { AccessToken } from "#shared/access-token";

export class UserCanDeleteUserDetail {
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
    const userToDelete = await UserService.getByUserDetailsId(
      userDetailToDelete.id,
    );

    return (
      userToDelete !== null &&
      PermissionService.isPermissionOver(
        accessToken.permission,
        userToDelete.permission,
      )
    );
  }
}
