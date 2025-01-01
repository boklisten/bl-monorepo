import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { companySchema } from "@backend/collections/company/company.schema";

export class CompanyCollection implements BlCollection {
  collectionName = BlCollectionName.Companies;
  mongooseSchema = companySchema;
  endpoints: BlEndpoint[] = [
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
  ];
}
