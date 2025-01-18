import { BlCollection } from "@backend/collections/bl-collection";
import { BlStorage } from "@backend/storage/bl-storage";

export const BranchItemCollection: BlCollection = {
  storage: BlStorage.BranchItems,
  endpoints: [
    {
      method: "getId",
    },
    {
      method: "post",
      restriction: {
        permission: "admin",
      },
    },
    {
      method: "patch",
      restriction: {
        permission: "admin",
      },
    },
    {
      method: "getAll",
      validQueryParams: [{ fieldName: "branch", type: "object-id" }],
    },
    {
      method: "delete",
      restriction: {
        permission: "admin",
      },
    },
  ],
};
