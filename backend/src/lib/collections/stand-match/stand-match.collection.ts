import { GetMyStandMatchesOperation } from "@backend/lib/collections/stand-match/operations/stand-match-getall-me.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

export const StandMatchCollection: BlCollection = {
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
