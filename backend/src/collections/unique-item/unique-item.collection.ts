import { BlCollection } from "@backend/collections/bl-collection";
import { GenerateUniqueIdsOperation } from "@backend/collections/unique-item/operations/generate-unique-ids-operation";
import { UniqueItemActiveOperation } from "@backend/collections/unique-item/operations/unique-item-active.operation";
import { BlStorage } from "@backend/storage/bl-storage";

export const UniqueItemCollection: BlCollection = {
  storage: BlStorage.UniqueItems,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "post",
      restriction: {
        permission: "employee",
      },
      operations: [
        {
          name: "generate",
          operation: new GenerateUniqueIdsOperation(),
          restriction: { permission: "admin" },
        },
      ],
    },
    {
      method: "getId",
      restriction: {
        permission: "employee",
      },
      operations: [
        {
          name: "active",
          operation: new UniqueItemActiveOperation(),
          /*
          restriction: {
            permissions: [""employee", "manager", "admin"]
          }
          */
        },
      ],
    },
    {
      method: "getAll",
      restriction: {
        permission: "employee",
      },
      validQueryParams: [
        { fieldName: "blid", type: "string" },
        { fieldName: "item", type: "object-id" },
      ],
    },
  ],
};
