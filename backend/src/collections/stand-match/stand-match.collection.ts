import { BlCollection } from "@backend/collections/bl-collection";
import { GetMyStandMatchesOperation } from "@backend/collections/stand-match/operations/stand-match-getall-me.operation";
import { BlStorage } from "@backend/storage/bl-storage";

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
