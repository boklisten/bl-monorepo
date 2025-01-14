import {
  BlCollection,
  BlCollectionName,
} from "@backend/collections/bl-collection";
import { GetMyStandMatchesOperation } from "@backend/collections/stand-match/operations/stand-match-getall-me.operation";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
export const StandMatchCollection: BlCollection = {
  collectionName: BlCollectionName.StandMatches,
  mongooseSchema: standMatchSchema,
  endpoints: [
    {
      method: "getAll",
      operations: [
        {
          name: "me",
          operation: new GetMyStandMatchesOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin"],
          },
        },
      ],
      restriction: {
        permissions: ["employee", "manager", "admin"],
      },
    },
  ],
};
