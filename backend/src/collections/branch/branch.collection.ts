import { BranchGetHook } from "@backend/collections/branch/hook/branch-get.hook.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

export const BranchCollection: BlCollection = {
  storage: BlStorage.Branches,
  endpoints: [
    {
      method: "getId",
      hook: new BranchGetHook(),
    },
    {
      method: "getAll",
      hook: new BranchGetHook(),
      validQueryParams: [
        {
          fieldName: "id",
          type: "string",
        },
        {
          fieldName: "name",
          type: "string",
        },
        {
          fieldName: "location.region",
          type: "string",
        },
        {
          fieldName: "location.bookable",
          type: "boolean",
        },
        {
          fieldName: "active",
          type: "boolean",
        },
        {
          fieldName: "location.address",
          type: "string",
        },
        {
          fieldName: "openingHours",
          type: "expand",
        },
      ],
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
  ],
};
