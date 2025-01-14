import {
  BlCollection,
  BlCollectionName,
} from "@backend/collections/bl-collection";
import { GenerateUniqueIdsOperation } from "@backend/collections/unique-item/operations/generate-unique-ids-operation";
import { UniqueItemActiveOperation } from "@backend/collections/unique-item/operations/unique-item-active.operation";
import { uniqueItemSchema } from "@backend/collections/unique-item/unique-item.schema";

export const UniqueItemCollection: BlCollection = {
  collectionName: BlCollectionName.UniqueItems,
  mongooseSchema: uniqueItemSchema,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "post",
      restriction: {
        permissions: ["employee", "manager", "admin"],
      },
      operations: [
        {
          name: "generate",
          operation: new GenerateUniqueIdsOperation(),
          restriction: { permissions: ["admin"] },
        },
      ],
    },
    {
      method: "getId",
      restriction: {
        permissions: ["employee", "manager", "admin"],
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
        permissions: ["employee", "manager", "admin"],
      },
      validQueryParams: [
        { fieldName: "blid", type: "string" },
        { fieldName: "item", type: "object-id" },
      ],
    },
  ],
};
