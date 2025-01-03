import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
export class StandMatchCollection implements BlCollection {
  public collectionName = BlCollectionName.StandMatches;
  public mongooseSchema = standMatchSchema;
  public endpoints: BlEndpoint[] = [
    {
      method: "getAll",
      operations: [
        /**
         *
        {
          name: "me",
          operation: new GetMyStandMatches(),
          restriction: {
            permissions: ["customer", "employee", "admin"],
          },
        },
         */
      ],
      restriction: {
        permissions: ["employee", "manager", "admin"],
      },
    },
  ];
}
