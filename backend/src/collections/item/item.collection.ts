import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { ItemPatchHook } from "@backend/collections/item/hook/item-patch.hook";
import { ItemPostHook } from "@backend/collections/item/hook/item-post.hook";
import { itemSchema } from "@backend/collections/item/item.schema";

export class ItemCollection implements BlCollection {
  collectionName = BlCollectionName.Items;
  mongooseSchema = itemSchema;
  endpoints: BlEndpoint[] = [
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
      hook: new ItemPostHook(),
      restriction: {
        permissions: ["admin"],
      },
    },
    {
      method: "patch",
      hook: new ItemPatchHook(),
      restriction: {
        permissions: ["admin"],
      },
    },
  ];
}
