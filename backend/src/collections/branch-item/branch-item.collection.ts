import { BlCollection } from "@backend/collections/bl-collection";
import { BranchItemModel } from "@backend/collections/branch-item/branch-item.model";

export const BranchItemCollection: BlCollection = {
  model: BranchItemModel,
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
