import {
  BlCollection,
  BlCollectionName,
} from "@backend/collections/bl-collection";
import { branchItemSchema } from "@backend/collections/branch-item/branch-item.schema";

export const BranchItemCollection: BlCollection = {
  collectionName: BlCollectionName.BranchItems,
  mongooseSchema: branchItemSchema,
  endpoints: [
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
  ],
};
