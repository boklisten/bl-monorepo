import { CustomerItemGenerateReportOperation } from "@backend/lib/collections/customer-item/customer-item-generate-report.operation.js";
import { CustomerItemPostHook } from "@backend/lib/collections/customer-item/hooks/customer-item-post.hook.js";
import { PublicBlidLookupOperation } from "@backend/lib/collections/customer-item/public-blid-lookup.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const CustomerItemCollection = {
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
                {
                    name: "public-blid-lookup",
                    operation: new PublicBlidLookupOperation(),
                    restriction: {
                        permission: "customer",
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
