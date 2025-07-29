import vine from "@vinejs/vine";

import { PermissionService } from "#services/permission_service";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlError } from "#shared/bl-error";
import { BlapiResponse } from "#shared/blapi-response";
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

    const userDetail = await BlStorage.UserDetails.get(documentId);

    const foundUsers = await BlStorage.Users.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const targetUser = await vine.validate({
      schema: vine.object({
        id: vine.string(),
        permission: userPermissionValidator,
      }),
      data: foundUsers[0],
    });

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

    await BlStorage.Users.update(targetUser.id, {
      permission: permissionChange,
    });

    return new BlapiResponse([{ success: true }]);
  }
}
