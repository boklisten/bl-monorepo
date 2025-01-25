import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

export const ItemCollection: BlCollection = {
  storage: BlStorage.Items,
  endpoints: [
    {
      method: "getId",
    },
    {
      method: "getAll",
      validQueryParams: [
        {
          fieldName: "title",
          type: "string",
        },
        {
          fieldName: "type",
          type: "string",
        },
        {
          fieldName: "info.isbn",
          type: "number",
        },
        {
          fieldName: "buyback",
          type: "boolean",
        },
        {
          fieldName: "creationTime",
          type: "date",
        },
        {
          fieldName: "price",
          type: "number",
        },
        {
          fieldName: "active",
          type: "boolean",
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
