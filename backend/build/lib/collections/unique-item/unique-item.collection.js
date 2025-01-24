import { GenerateUniqueIdsOperation } from "@backend/lib/collections/unique-item/operations/generate-unique-ids-operation.js";
import { UniqueItemActiveOperation } from "@backend/lib/collections/unique-item/operations/unique-item-active.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const UniqueItemCollection = {
    storage: BlStorage.UniqueItems,
    documentPermission: {
        viewableForPermission: "employee",
    },
    endpoints: [
        {
            method: "post",
            restriction: {
                permission: "employee",
            },
            operations: [
                {
                    name: "generate",
                    operation: new GenerateUniqueIdsOperation(),
                    restriction: { permission: "admin" },
                },
            ],
        },
        {
            method: "getId",
            restriction: {
                permission: "employee",
            },
            operations: [
                {
                    name: "active",
                    operation: new UniqueItemActiveOperation(),
                    /*
                    restriction: {
                      permissions: [""employee", "manager", "admin"]
                    }
                    */
                },
            ],
        },
        {
            method: "getAll",
            restriction: {
                permission: "employee",
            },
            validQueryParams: [
                { fieldName: "blid", type: "string" },
                { fieldName: "item", type: "object-id" },
            ],
        },
    ],
};
