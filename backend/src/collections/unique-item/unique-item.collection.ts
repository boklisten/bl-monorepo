import {
  BlCollection,
  BlCollectionName,
  BlDocumentPermission,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { GenerateUniqueIdsOperation } from "@backend/collections/unique-item/operations/generate-unique-ids-operation";
import { UniqueItemActiveOperation } from "@backend/collections/unique-item/operations/unique-item-active.operation";
import { uniqueItemSchema } from "@backend/collections/unique-item/unique-item.schema";

export class UniqueItemCollection implements BlCollection {
  public collectionName = BlCollectionName.UniqueItems;
  public mongooseSchema = uniqueItemSchema;
  documentPermission: BlDocumentPermission = {
    viewableForPermission: "employee",
  };

  public endpoints: BlEndpoint[] = [
    {
      method: "post",
      restriction: {
        permissions: ["employee", "manager", "admin", "super"],
      },
      operations: [
        {
          name: "generate",
          operation: new GenerateUniqueIdsOperation(),
          restriction: { permissions: ["admin", "super"] },
        },
      ],
    },
    {
      method: "getId",
      restriction: {
        permissions: ["employee", "manager", "admin", "super"],
      },
      operations: [
        {
          name: "active",
          operation: new UniqueItemActiveOperation(),
          /*
          restriction: {
            permissions: [""employee", "manager", "admin", "super"]
          }
          */
        },
      ],
    },
    {
      method: "getAll",
      restriction: {
        permissions: ["employee", "manager", "admin", "super"],
      },
      validQueryParams: [
        { fieldName: "blid", type: "string" },
        { fieldName: "item", type: "object-id" },
      ],
    },
  ];
}
