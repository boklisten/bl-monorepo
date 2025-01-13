import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { GetMyStandMatchesOperation } from "@backend/collections/stand-match/operations/stand-match-getall-me.operation";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
export class StandMatchCollection implements BlCollection {
  public collectionName = BlCollectionName.StandMatches;
  public mongooseSchema = standMatchSchema;
  public endpoints: BlEndpoint[] = [
    {
      method: "getAll",
      operations: [
        {
          name: "me",
          operation: new GetMyStandMatchesOperation(),
          restriction: {
            permissions: ["customer", "employee", "admin"],
          },
        },
      ],
      restriction: {
        permissions: ["employee", "manager", "admin"],
      },
    },
  ];
}
