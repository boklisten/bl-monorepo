import { BlDocument } from "@shared/bl-document/bl-document.js";
import {
  UserPermission,
  UserPermissionEnum,
} from "@shared/permission/user-permission.js";

import { BlDocumentPermission } from "#services/types/bl-collection";

function isAdmin(userPermission: UserPermission) {
  return userPermission === UserPermissionEnum.enum.admin;
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

export const PermissionService = {
  isAdmin,
  haveRestrictedDocumentPermission,
  isPermissionEqualOrOver,
  isPermissionOver,
};
