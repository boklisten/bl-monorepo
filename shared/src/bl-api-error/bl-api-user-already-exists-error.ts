import { BlApiError } from "@shared/bl-api-error/bl-api-error";
import { UserPermission } from "@shared/permission/user-permission";

export class BlApiUserAlreadyExistsError extends BlApiError {
  permission?: UserPermission;
  permissionRequired?: UserPermission;
  name?: string;

  constructor(
    message?: string,
    code?: number,
    permission?: UserPermission,
    permissionRequired?: UserPermission,
  ) {
    super(message, code);

    this.name = "BlApiUserAlreadyExistsError";

    if (permission) {
      this.permission = permission;
    }

    if (permissionRequired) {
      this.permissionRequired = permissionRequired;
    }
  }
}
