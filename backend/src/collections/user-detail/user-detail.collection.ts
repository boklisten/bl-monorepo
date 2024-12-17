import {
  BlCollection,
  BlCollectionName,
  BlDocumentPermission,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { UserDetailDeleteHook } from "@backend/collections/user-detail/hooks/user-detail-delete.hook";
import { UserDetailUpdateHook } from "@backend/collections/user-detail/hooks/user-detail-update.hook";
import { UserDetailChangeEmailOperation } from "@backend/collections/user-detail/operations/change-email/user-detail-change-email.operation";
import { UserDetailPermissionOperation } from "@backend/collections/user-detail/operations/permission/user-detail-permission.operation";
import { UserDetailReadPermissionOperation } from "@backend/collections/user-detail/operations/read-permission/user-detail-read-permission.operation";
import { UserDetailValidOperation } from "@backend/collections/user-detail/operations/user-detail-valid.operation";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";

export class UserDetailCollection implements BlCollection {
  collectionName = BlCollectionName.UserDetails;
  mongooseSchema = userDetailSchema;
  documentPermission: BlDocumentPermission = {
    viewableForPermission: "employee",
  };
  endpoints: BlEndpoint[] = [
    {
      method: "getId",
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
      operations: [
        {
          name: "valid",
          operation: new UserDetailValidOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin", "super"],
            restricted: true,
          },
        },
        {
          name: "permission",
          operation: new UserDetailReadPermissionOperation(),
          restriction: {
            permissions: ["admin", "super"],
          },
        },
      ],
    },
    {
      method: "patch",
      hook: new UserDetailUpdateHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
      operations: [
        {
          name: "permission",
          operation: new UserDetailPermissionOperation(),
          restriction: {
            permissions: ["admin", "super"],
          },
        },
        {
          name: "email",
          operation: new UserDetailChangeEmailOperation(),
          restriction: {
            permissions: ["manager", "admin", "super"],
          },
        },
      ],
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin", "super"],
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
        permissions: ["employee", "manager", "admin", "super"],
      },
    },
  ];
}
