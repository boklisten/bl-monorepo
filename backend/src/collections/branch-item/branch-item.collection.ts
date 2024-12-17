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
        permissions: ["admin", "super"],
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["admin", "super"],
      },
    },
    {
      method: "getAll",
      validQueryParams: [{ fieldName: "branch", type: "object-id" }],
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin", "super"],
      },
    },
  ];
}
