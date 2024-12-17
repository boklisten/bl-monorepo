import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@/collections/bl-collection";
import { matchSchema } from "@/collections/match/match.schema";
import { MatchGenerateOperation } from "@/collections/match/operations/match-generate.operation";
import { GetMyMatchesOperation } from "@/collections/match/operations/match-getall-me.operation";
import { MatchLockOperation } from "@/collections/match/operations/match-lock.operation";
import { MatchNotifyOperation } from "@/collections/match/operations/match-notify.operation";
import { MatchTransferItemOperation } from "@/collections/match/operations/match-transfer-item.operation";

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
          restriction: { permissions: ["admin", "super"] },
        },
        {
          name: "notify",
          operation: new MatchNotifyOperation(),
          restriction: { permissions: ["admin", "super"] },
        },
        {
          name: "transfer-item",
          operation: new MatchTransferItemOperation(),
          restriction: {
            permissions: ["customer", "employee", "admin", "super"],
          },
        },
        {
          name: "lock",
          operation: new MatchLockOperation(),
          restriction: {
            permissions: ["employee", "manager", "admin", "super"],
          },
        },
      ],
      restriction: {
        permissions: ["super"],
      },
    },
    {
      method: "getAll",
      operations: [
        {
          name: "me",
          operation: new GetMyMatchesOperation(),
          restriction: {
            permissions: ["customer", "employee", "admin", "super"],
          },
        },
      ],
      restriction: {
        permissions: ["employee", "manager", "admin", "super"],
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
        permissions: ["employee", "admin", "super"],
      },
    },
  ];
}
