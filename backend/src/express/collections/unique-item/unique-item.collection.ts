import { GenerateUniqueIdsOperation } from "@backend/express/collections/unique-item/operations/generate-unique-ids-operation.js";
import { UniqueItemActiveOperation } from "@backend/express/collections/unique-item/operations/unique-item-active.operation.js";
import { BlStorage } from "@backend/express/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

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
