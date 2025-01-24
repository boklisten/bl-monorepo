import { BranchGetHook } from "@backend/lib/collections/branch/hook/branch-get.hook.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const BranchCollection = {
    storage: BlStorage.Branches,
    endpoints: [
        {
            method: "getId",
            hook: new BranchGetHook(),
        },
        {
            method: "getAll",
            hook: new BranchGetHook(),
            validQueryParams: [
                {
                    fieldName: "id",
                    type: "string",
                },
                {
                    fieldName: "name",
                    type: "string",
                },
                {
                    fieldName: "location.region",
                    type: "string",
                },
                {
                    fieldName: "location.bookable",
                    type: "boolean",
                },
                {
                    fieldName: "active",
                    type: "boolean",
                },
                {
                    fieldName: "location.address",
                    type: "string",
                },
                {
                    fieldName: "openingHours",
                    type: "expand",
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
