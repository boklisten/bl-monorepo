import { BlApiError } from "./bl-api-error";
import { UserPermission } from "../permission/user-permission";

export class BlApiUserAlreadyExistsError extends BlApiError {
  permission?: UserPermission;
  permissionRequired?: UserPermission;
  name?: string;

  constructor(
    msg?: string,
    code?: number,
    permission?: UserPermission,
    permissionRequired?: UserPermission,
  ) {
    super(msg, code);

    this.name = "BlApiUserAlreadyExistsError";

    if (permission) {
      this.permission = permission;
    }

    if (permissionRequired) {
      this.permissionRequired = permissionRequired;
    }
  }
}
