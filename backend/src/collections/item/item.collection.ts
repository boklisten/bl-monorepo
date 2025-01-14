import { BlCollection } from "@backend/collections/bl-collection";
import { ItemModel } from "@backend/collections/item/item.model";

export const ItemCollection: BlCollection = {
  model: ItemModel,
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
        permissions: ["admin"],
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["admin"],
      },
    },
  ],
};
