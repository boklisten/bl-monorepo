import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { matchSchema } from "@backend/collections/match/match.schema";
import { MatchGenerateOperation } from "@backend/collections/match/operations/match-generate.operation";
import { GetMyMatchesOperation } from "@backend/collections/match/operations/match-getall-me.operation";
import { MatchLockOperation } from "@backend/collections/match/operations/match-lock.operation";
import { MatchNotifyOperation } from "@backend/collections/match/operations/match-notify.operation";
import { MatchTransferItemOperation } from "@backend/collections/match/operations/match-transfer-item.operation";

export class MatchCollection implements BlCollection {
  public collectionName = BlCollectionName.Matches;
  public mongooseSchema = matchSchema;
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
          operation: new MatchTransferItemOperation(),
          restriction: {
            permissions: ["customer", "employee", "admin"],
          },
        },
        {
          name: "lock",
          operation: new MatchLockOperation(),
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
          operation: new GetMyMatchesOperation(),
          restriction: {
            permissions: ["customer", "employee", "admin"],
          },
        },
      ],
      restriction: {
        permissions: ["employee", "manager", "admin"],
      },
      validQueryParams: [
        { fieldName: "_variant", type: "string" },
        { fieldName: "sender", type: "object-id" },
        { fieldName: "receiver", type: "object-id" },
        { fieldName: "customer", type: "object-id" },
      ],
    },
    {
      method: "getId",
      restriction: {
        permissions: ["employee", "admin"],
      },
    },
  ];
}
