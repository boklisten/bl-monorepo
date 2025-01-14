import { BlCollection } from "@backend/collections/bl-collection";
import { CustomerItemGenerateReportOperation } from "@backend/collections/customer-item/customer-item-generate-report.operation";
import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { CustomerItemPostHook } from "@backend/collections/customer-item/hooks/customer-item-post.hook";
import { PublicBlidLookupOperation } from "@backend/collections/customer-item/public-blid-lookup.operation";
import { ItemModel } from "@backend/collections/item/item.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";

export const CustomerItemCollection: BlCollection = {
  model: CustomerItemModel,
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
          model: UserDetailModel,
        },
        {
          field: "item",
          model: ItemModel,
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
