import { BlDocumentPermission } from "#services/types/bl-collection";
import { BlDocument } from "#shared/bl-document/bl-document";
import {
  USER_PERMISSION,
  UserPermission,
} from "#shared/permission/user-permission";

function isAdmin(userPermission: UserPermission) {
  return userPermission === USER_PERMISSION.ADMIN;
}

function haveRestrictedDocumentPermission(
  userId: string,
  userPermission: UserPermission,
  document: BlDocument,
  documentPermission?: BlDocumentPermission,
): boolean {
  if (
    document.user?.id === userId ||
    isPermissionOver(userPermission, document.user?.permission)
  ) {
    return true;
  }

  if (documentPermission?.viewableForPermission) {
    return isPermissionEqualOrOver(
      userPermission,
      documentPermission.viewableForPermission,
    );
  }

  return false;
}

function isPermissionEqualOrOver(
  permission: UserPermission,
  restrictedPermission: UserPermission,
): boolean {
  return permission === restrictedPermission
    ? true
    : isPermissionOver(permission, restrictedPermission);
}

function isPermissionOver(
  permission?: UserPermission,
  restrictedPermission?: UserPermission,
): boolean {
  if (!restrictedPermission || !permission) return false;
  const { CUSTOMER, EMPLOYEE, MANAGER, ADMIN } = USER_PERMISSION;

  if (permission === EMPLOYEE && restrictedPermission === CUSTOMER) {
    return true;
  }

  if (
    permission === MANAGER &&
    (restrictedPermission === EMPLOYEE || restrictedPermission === CUSTOMER)
  ) {
    return true;
  }

  return (
    permission === ADMIN &&
    (restrictedPermission === MANAGER ||
      restrictedPermission === EMPLOYEE ||
      restrictedPermission === CUSTOMER)
  );
}

export const PermissionService = {
  isAdmin,
  haveRestrictedDocumentPermission,
  isPermissionEqualOrOver,
  isPermissionOver,
};
