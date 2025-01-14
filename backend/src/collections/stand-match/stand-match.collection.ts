import { BlCollection } from "@backend/collections/bl-collection";
import { GetMyStandMatchesOperation } from "@backend/collections/stand-match/operations/stand-match-getall-me.operation";
import { StandMatchModel } from "@backend/collections/stand-match/stand-match.model";

export const StandMatchCollection: BlCollection = {
  model: StandMatchModel,
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
