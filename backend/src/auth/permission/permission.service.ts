import {
  BlDocumentPermission,
  BlEndpointRestriction,
} from "@backend/collections/bl-collection";
import { BlDocument } from "@shared/bl-document/bl-document";
import { UserPermission } from "@shared/permission/user-permission";

export class SystemUser {
  id = "SYSTEM";
  permission: UserPermission = "admin";
}

export class PermissionService {
  private validPermissions: UserPermission[] = [
    "customer",
    "employee",
    "manager",
    "admin",
    "super",
  ];

  public isPermission(permission: unknown): permission is UserPermission {
    return (
      typeof permission === "string" &&
      this.validPermissions.includes(permission as UserPermission)
    );
  }
  public hasPermissionField(
    object: unknown,
  ): object is { permission: UserPermission } {
    return (
      typeof object === "object" &&
      object !== null &&
      "permission" in object &&
      this.isPermission(object.permission)
    );
  }

  public getLowestPermission(
    userPermissions: UserPermission[],
  ): UserPermission {
    if (userPermissions.includes("customer")) {
      return "customer";
    }

    if (userPermissions.includes("employee")) {
      return "employee";
    }

    if (userPermissions.includes("manager")) {
      return "manager";
    }

    if (userPermissions.includes("admin")) {
      return "admin";
    }

    return "super";
  }

  public isAdmin(userPermission: UserPermission) {
    return userPermission === "admin" || userPermission === "super";
  }

  public haveDocumentPermission(
    userPermission: UserPermission,
    document: BlDocument,
  ) {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.isPermissionOver(userPermission, document.user.permission) ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      userPermission === document.user.permission
    );
  }

  public haveRestrictedDocumentPermission(
    userId: string,
    userPermission: UserPermission,
    document: BlDocument,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    endpointRestriction: BlEndpointRestriction,
    documentPermission?: BlDocumentPermission,
  ): boolean {
    if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      document.user.id === userId ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.isPermissionOver(userPermission, document.user.permission)
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
    permission: UserPermission,
    restrictedPermission: UserPermission,
  ): boolean {
    if (!restrictedPermission || !permission) return false;

    if (permission === "employee" && restrictedPermission === "customer") {
      return true;
    }

    if (
      permission === "manager" &&
      (restrictedPermission === "employee" ||
        restrictedPermission === "customer")
    ) {
      return true;
    }

    if (
      permission === "admin" &&
      (restrictedPermission === "manager" ||
        restrictedPermission === "employee" ||
        restrictedPermission === "customer")
    ) {
      return true;
    }

    return permission === "super";
  }
}
