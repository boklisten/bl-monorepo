import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const OpeningHourCollection = {
    storage: BlStorage.OpeningHours,
    endpoints: [
        {
            method: "getId",
        },
        {
            method: "getAll",
            validQueryParams: [
                {
                    fieldName: "branch",
                    type: "object-id",
                },
                {
                    fieldName: "to",
                    type: "date",
                },
                {
                    fieldName: "from",
                    type: "date",
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
