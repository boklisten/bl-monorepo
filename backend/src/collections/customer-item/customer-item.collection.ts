import {
  BlCollection,
  BlCollectionName,
} from "@backend/collections/bl-collection";
import { CustomerItemGenerateReportOperation } from "@backend/collections/customer-item/customer-item-generate-report.operation";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { CustomerItemPostHook } from "@backend/collections/customer-item/hooks/customer-item-post.hook";
import { PublicBlidLookupOperation } from "@backend/collections/customer-item/public-blid-lookup.operation";
import { itemSchema } from "@backend/collections/item/item.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";

export const CustomerItemCollection: BlCollection = {
  collectionName: BlCollectionName.CustomerItems,
  mongooseSchema: customerItemSchema,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "getId",
      restriction: {
        permissions: ["customer", "employee", "manager", "admin"],
        restricted: true,
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["customer", "employee", "manager", "admin"],
        restricted: true,
      },
    },
    {
      method: "post",
      hook: new CustomerItemPostHook(),
      operations: [
        {
          name: "generate-report",
          operation: new CustomerItemGenerateReportOperation(),
          restriction: {
            permissions: ["admin"],
          },
        },
        {
          name: "public-blid-lookup",
          operation: new PublicBlidLookupOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin"],
          },
        },
      ],
      restriction: {
        permissions: ["employee", "manager", "admin"],
      },
    },
    {
      method: "getAll",
      restriction: {
        permissions: ["employee", "manager", "admin"],
      },
      nestedDocuments: [
        {
          field: "customer",
          collection: BlCollectionName.UserDetails,
          mongooseSchema: userDetailSchema,
        },
        {
          field: "item",
          collection: BlCollectionName.Items,
          mongooseSchema: itemSchema,
        },
      ],
      validQueryParams: [
        {
          fieldName: "creationTime",
          type: "date",
        },
        {
          fieldName: "deadline",
          type: "date",
        },
        {
          fieldName: "item",
          type: "string",
        },
        {
          fieldName: "customer",
          type: "object-id",
        },
        {
          fieldName: "handout",
          type: "boolean",
        },
        {
          fieldName: "handoutInfo.handoutEmployee",
          type: "string",
        },
        {
          fieldName: "handoutInfo.handoutById",
          type: "string",
        },
        {
          fieldName: "returned",
          type: "boolean",
        },
        {
          fieldName: "match",
          type: "boolean",
        },
        {
          fieldName: "type",
          type: "string",
        },
        {
          fieldName: "buyout",
          type: "boolean",
        },
        {
          fieldName: "returnInfo.returnEmployee",
          type: "string",
        },
        {
          fieldName: "customer",
          type: "expand",
        },
        {
          fieldName: "item",
          type: "expand",
        },
        {
          fieldName: "blid",
          type: "string",
        },
      ],
    },
  ],
};
