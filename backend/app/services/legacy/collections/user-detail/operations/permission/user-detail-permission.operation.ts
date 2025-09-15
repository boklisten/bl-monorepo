import vine from "@vinejs/vine";

import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import { UserService } from "#services/user_service";
import { BlError } from "#shared/bl-error";
import { BlapiResponse } from "#shared/blapi-response";
import { BlApiRequest } from "#types/bl-api-request";
import { Operation } from "#types/operation";
import { userPermissionValidator } from "#validators/user_permission_validator";

const userDetailPermissionValidator = vine.object({
  documentId: vine.string(),
  data: vine.object({
    permission: userPermissionValidator,
  }),
  user: vine.object({
    id: vine.string(),
    permission: userPermissionValidator,
  }),
});

export class UserDetailPermissionOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    const { documentId, data, user } = await vine.validate({
      schema: userDetailPermissionValidator,
      data: blApiRequest,
    });
    const permissionChange = data.permission;

    if (documentId == user.id) {
      throw new BlError("user can not change own permission");
    }

    const targetUser = await UserService.getByUserDetailsId(documentId);
    if (!targetUser) return new BlapiResponse([{ success: false }]);

    if (
      !PermissionService.isAdmin(user.permission) ||
      !PermissionService.isPermissionOver(
        user.permission,
        targetUser.permission,
      ) ||
      !PermissionService.isPermissionOver(user.permission, permissionChange)
    ) {
      throw new BlError("no access to change permission").code(904);
    }

    await StorageService.Users.update(targetUser.id, {
      permission: permissionChange,
    });

    return new BlapiResponse([{ success: true }]);
  }
}
