import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { branchItemSchema } from "@backend/collections/branch-item/branch-item.schema";

export class BranchItemCollection implements BlCollection {
  collectionName = BlCollectionName.BranchItems;
  mongooseSchema = branchItemSchema;
  endpoints: BlEndpoint[] = [
    {
      method: "getId",
    },
    {
      method: "post",
      restriction: {
        permissions: ["admin"],
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["admin"],
      },
    },
    {
      method: "getAll",
      validQueryParams: [{ fieldName: "branch", type: "object-id" }],
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin"],
      },
    },
  ];
}
