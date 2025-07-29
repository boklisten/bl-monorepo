import { UserDetailDeleteHook } from "#services/legacy/collections/user-detail/hooks/user-detail-delete.hook";
import { UserDetailUpdateHook } from "#services/legacy/collections/user-detail/hooks/user-detail-update.hook";
import { UserDetailChangeEmailOperation } from "#services/legacy/collections/user-detail/operations/change-email/user-detail-change-email.operation";
import { UserDetailPermissionOperation } from "#services/legacy/collections/user-detail/operations/permission/user-detail-permission.operation";
import { UserDetailReadPermissionOperation } from "#services/legacy/collections/user-detail/operations/read-permission/user-detail-read-permission.operation";
import { UserDetailValidOperation } from "#services/legacy/collections/user-detail/operations/user-detail-valid.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

export const UserDetailCollection: BlCollection = {
  storage: BlStorage.UserDetails,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "getId",
      restriction: {
        permission: "customer",
        restricted: true,
      },
      operations: [
        {
          name: "valid",
          operation: new UserDetailValidOperation(),
          restriction: {
            permission: "customer",
            restricted: true,
          },
        },
        {
          name: "permission",
          operation: new UserDetailReadPermissionOperation(),
          restriction: {
            permission: "admin",
          },
        },
      ],
    },
    {
      method: "patch",
      hook: new UserDetailUpdateHook(),
      restriction: {
        permission: "customer",
        restricted: true,
      },
      operations: [
        {
          name: "permission",
          operation: new UserDetailPermissionOperation(),
          restriction: {
            permission: "admin",
          },
        },
        {
          name: "email",
          operation: new UserDetailChangeEmailOperation(),
          restriction: {
            permission: "manager",
          },
        },
      ],
    },
    {
      method: "delete",
      restriction: {
        permission: "admin",
      },
      hook: new UserDetailDeleteHook(),
    },
    {
      method: "getAll",
      validQueryParams: [
        {
          fieldName: "email",
          type: "string",
        },
        {
          fieldName: "branch",
          type: "object-id",
        },
        {
          fieldName: "name",
          type: "string",
        },
        {
          fieldName: "phone",
          type: "string",
        },
        {
          fieldName: "address",
          type: "string",
        },
        {
          fieldName: "postCity",
          type: "string",
        },
        {
          fieldName: "postCode",
          type: "string",
        },
        {
          fieldName: "_id",
          type: "object-id",
        },
      ],
      restriction: {
        permission: "employee",
      },
    },
  ],
};
