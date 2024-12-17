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
        permissions: ["admin", "super"],
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
        permissions: ["admin", "super"],
      },
    },
    {
      method: "post",
      restriction: {
        permissions: ["admin", "super"],
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["admin", "super"],
      },
    },
    {
      method: "delete",
      restriction: {
        permissions: ["admin", "super"],
      },
    },
  ];
}
