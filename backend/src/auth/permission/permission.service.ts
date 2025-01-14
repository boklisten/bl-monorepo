import { BlDocumentPermission } from "@backend/collections/bl-collection";
import { BlDocument } from "@shared/bl-document/bl-document";
import {
  UserPermission,
  UserPermissionEnum,
} from "@shared/permission/user-permission";

export class PermissionService {
  public isAdmin(userPermission: UserPermission) {
    return userPermission === UserPermissionEnum.enum.admin;
  }

  public haveRestrictedDocumentPermission(
    userId: string,
    userPermission: UserPermission,
    document: BlDocument,
    documentPermission?: BlDocumentPermission,
  ): boolean {
    if (
      document.user?.id === userId ||
      this.isPermissionOver(userPermission, document.user?.permission)
    ) {
      return true;
    }

    if (documentPermission?.viewableForPermission) {
      return this.isPermissionEqualOrOver(
        userPermission,
        documentPermission.viewableForPermission,
      );
    }

    return false;
  }

  public isPermissionEqualOrOver(
    permission: UserPermission,
    restrictedPermission: UserPermission,
  ): boolean {
    return permission === restrictedPermission
      ? true
      : this.isPermissionOver(permission, restrictedPermission);
  }

  public isPermissionOver(
    permission?: UserPermission,
    restrictedPermission?: UserPermission,
  ): boolean {
    if (!restrictedPermission || !permission) return false;
    const { customer, employee, manager, admin } = UserPermissionEnum.enum;

    if (permission === employee && restrictedPermission === customer) {
      return true;
    }

    if (
      permission === manager &&
      (restrictedPermission === employee || restrictedPermission === customer)
    ) {
      return true;
    }

    return (
      permission === admin &&
      (restrictedPermission === manager ||
        restrictedPermission === employee ||
        restrictedPermission === customer)
    );
  }
}
