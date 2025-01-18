import { BlCollection } from "@backend/collections/bl-collection";
import { BlStorage } from "@backend/storage/bl-storage";

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
