import { BlCollection } from "@backend/collections/bl-collection";
import { BlStorage } from "@backend/storage/bl-storage";

export const CompanyCollection: BlCollection = {
  storage: BlStorage.Companies,
  endpoints: [
    {
      method: "getAll",
      restriction: {
        permissions: ["admin"],
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
        permissions: ["admin"],
      },
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
      method: "delete",
      restriction: {
        permissions: ["admin"],
      },
    },
  ],
};
