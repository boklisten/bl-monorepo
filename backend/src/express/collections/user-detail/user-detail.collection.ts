import { UserDetailDeleteHook } from "@backend/express/collections/user-detail/hooks/user-detail-delete.hook.js";
import { UserDetailUpdateHook } from "@backend/express/collections/user-detail/hooks/user-detail-update.hook.js";
import { UserDetailChangeEmailOperation } from "@backend/express/collections/user-detail/operations/change-email/user-detail-change-email.operation.js";
import { UserDetailPermissionOperation } from "@backend/express/collections/user-detail/operations/permission/user-detail-permission.operation.js";
import { UserDetailReadPermissionOperation } from "@backend/express/collections/user-detail/operations/read-permission/user-detail-read-permission.operation.js";
import { UserDetailValidOperation } from "@backend/express/collections/user-detail/operations/user-detail-valid.operation.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

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
