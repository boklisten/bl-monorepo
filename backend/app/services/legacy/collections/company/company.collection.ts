import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#types/bl-collection";

export const CompanyCollection: BlCollection = {
  storage: BlStorage.Companies,
  endpoints: [
    {
      method: "getAll",
      restriction: {
        permission: "admin",
      },
      validQueryParams: [
        {
          fieldName: "name",
          type: "string",
        },
      ],
    },
    {
      method: "getId",
      restriction: {
        permission: "admin",
      },
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
      method: "delete",
      restriction: {
        permission: "admin",
      },
    },
  ],
};
