import { UserPermissionEnum, } from "@shared/permission/user-permission.js";
function isAdmin(userPermission) {
    return userPermission === UserPermissionEnum.enum.admin;
}
function haveRestrictedDocumentPermission(userId, userPermission, document, documentPermission) {
    if (document.user?.id === userId ||
        isPermissionOver(userPermission, document.user?.permission)) {
        return true;
    }
    if (documentPermission?.viewableForPermission) {
        return isPermissionEqualOrOver(userPermission, documentPermission.viewableForPermission);
    }
    return false;
}
function isPermissionEqualOrOver(permission, restrictedPermission) {
    return permission === restrictedPermission
        ? true
        : isPermissionOver(permission, restrictedPermission);
}
function isPermissionOver(permission, restrictedPermission) {
    if (!restrictedPermission || !permission)
        return false;
    const { customer, employee, manager, admin } = UserPermissionEnum.enum;
    if (permission === employee && restrictedPermission === customer) {
        return true;
    }
    if (permission === manager &&
        (restrictedPermission === employee || restrictedPermission === customer)) {
        return true;
    }
    return (permission === admin &&
        (restrictedPermission === manager ||
            restrictedPermission === employee ||
            restrictedPermission === customer));
}
export const PermissionService = {
    isAdmin,
    haveRestrictedDocumentPermission,
    isPermissionEqualOrOver,
    isPermissionOver,
};
