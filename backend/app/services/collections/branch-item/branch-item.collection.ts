import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

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
