import {
  BlCollection,
  BlCollectionName,
  BlDocumentPermission,
  BlEndpoint,
} from "@/collections/bl-collection";
import { CustomerItemGenerateReportOperation } from "@/collections/customer-item/customer-item-generate-report.operation";
import { customerItemSchema } from "@/collections/customer-item/customer-item.schema";
import { CustomerItemPostHook } from "@/collections/customer-item/hooks/customer-item-post.hook";
import { PublicBlidLookupOperation } from "@/collections/customer-item/public-blid-lookup.operation";
import { itemSchema } from "@/collections/item/item.schema";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";

export class CustomerItemCollection implements BlCollection {
  collectionName = BlCollectionName.CustomerItems;
  mongooseSchema = customerItemSchema;
  documentPermission: BlDocumentPermission = {
    viewableForPermission: "employee",
  };
  endpoints: BlEndpoint[] = [
    {
      method: "getId",
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
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
            permissions: ["admin", "super"],
          },
        },
        {
          name: "public-blid-lookup",
          operation: new PublicBlidLookupOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin", "super"],
          },
        },
      ],
      restriction: {
        permissions: ["employee", "manager", "admin", "super"],
      },
    },
    {
      method: "getAll",
      restriction: {
        permissions: ["employee", "manager", "admin", "super"],
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
  ];
}
