import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const BranchItemCollection = {
    storage: BlStorage.BranchItems,
    endpoints: [
        {
            method: "getId",
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
            method: "getAll",
            validQueryParams: [{ fieldName: "branch", type: "object-id" }],
        },
        {
            method: "delete",
            restriction: {
                permission: "admin",
            },
        },
    ],
};
