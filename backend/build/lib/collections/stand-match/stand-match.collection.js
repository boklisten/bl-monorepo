import { GetMyStandMatchesOperation } from "@backend/lib/collections/stand-match/operations/stand-match-getall-me.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const StandMatchCollection = {
    storage: BlStorage.StandMatches,
    endpoints: [
        {
            method: "getAll",
            operations: [
                {
                    name: "me",
                    operation: new GetMyStandMatchesOperation(),
                    restriction: {
                        permission: "customer",
                    },
                },
            ],
            restriction: {
                permission: "employee",
            },
        },
    ],
};
