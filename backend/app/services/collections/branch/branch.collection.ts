import { BranchGetHook } from "#services/collections/branch/hook/branch-get.hook";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

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
