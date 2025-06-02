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
      validQueryParams: [
        { fieldName: "branch", type: "object-id" },
        { fieldName: "item", type: "expand" },
      ],
      nestedDocuments: [
        {
          field: "item",
          storage: BlStorage.Items,
        },
      ],
    },
    {
      method: "delete",
      restriction: {
        permission: "admin",
      },
    },
  ],
};
