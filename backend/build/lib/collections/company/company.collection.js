import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const CompanyCollection = {
    storage: BlStorage.Companies,
    endpoints: [
        {
            method: "getAll",
            restriction: {
                permission: "admin",
            },
            validQueryParams: [
                {
                    fieldName: "name",
                    type: "string",
                },
            ],
        },
        {
            method: "getId",
            restriction: {
                permission: "admin",
            },
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
        {
            method: "delete",
            restriction: {
                permission: "admin",
            },
        },
    ],
};
