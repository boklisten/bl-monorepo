import { GetMyStandMatchesOperation } from "#services/collections/stand-match/operations/stand-match-getall-me.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

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
