import { BlCollection } from "@backend/collections/bl-collection";
import { CompanyModel } from "@backend/collections/company/company.model";

export const CompanyCollection: BlCollection = {
  model: CompanyModel,
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
