import { CustomerItemGenerateReportOperation } from "#services/collections/customer-item/customer-item-generate-report.operation";
import { CustomerItemPostHook } from "#services/collections/customer-item/hooks/customer-item-post.hook";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

export const CustomerItemCollection: BlCollection = {
  storage: BlStorage.CustomerItems,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "getId",
      restriction: {
        permission: "customer",
        restricted: true,
      },
    },
    {
      method: "patch",
      restriction: {
        permission: "customer",
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
            permission: "admin",
          },
        },
      ],
      restriction: {
        permission: "employee",
      },
    },
    {
      method: "getAll",
      restriction: {
        permission: "employee",
      },
      nestedDocuments: [
        {
          field: "customer",
          storage: BlStorage.UserDetails,
        },
        {
          field: "item",
          storage: BlStorage.Items,
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
