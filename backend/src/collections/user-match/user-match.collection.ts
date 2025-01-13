import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { MatchGenerateOperation } from "@backend/collections/user-match/operations/match-generate.operation";
import { MatchNotifyOperation } from "@backend/collections/user-match/operations/match-notify.operation";
import { GetMyUserMatchesOperation } from "@backend/collections/user-match/operations/user-match-getall-me.operation";
import { UserMatchLockOperation } from "@backend/collections/user-match/operations/user-match-lock.operation";
import { UserMatchTransferItemOperation } from "@backend/collections/user-match/operations/user-match-transfer-item.operation";
import { userMatchSchema } from "@backend/collections/user-match/user-match.schema";

export class UserMatchCollection implements BlCollection {
  public collectionName = BlCollectionName.UserMatches;
  public mongooseSchema = userMatchSchema;
  public endpoints: BlEndpoint[] = [
    {
      method: "post",
      operations: [
        {
          name: "generate",
          operation: new MatchGenerateOperation(),
          restriction: { permissions: ["admin"] },
        },
        {
          name: "notify",
          operation: new MatchNotifyOperation(),
          restriction: { permissions: ["admin"] },
        },
        {
          name: "transfer-item",
          operation: new UserMatchTransferItemOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin"],
          },
        },
        {
          name: "lock",
          operation: new UserMatchLockOperation(),
          restriction: {
            permissions: ["employee", "manager", "admin"],
          },
        },
      ],
      restriction: {
        permissions: ["admin"],
      },
    },
    {
      method: "getAll",
      operations: [
        {
          name: "me",
          operation: new GetMyUserMatchesOperation(),
          restriction: {
            permissions: ["customer", "employee", "manager", "admin"],
          },
        },
      ],
      restriction: {
        permissions: ["employee", "manager", "admin"],
      },
    },
  ];
}
