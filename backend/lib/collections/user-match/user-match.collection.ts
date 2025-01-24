import { MatchGenerateOperation } from "@backend/lib/collections/user-match/operations/match-generate.operation.js";
import { MatchNotifyOperation } from "@backend/lib/collections/user-match/operations/match-notify.operation.js";
import { GetMyUserMatchesOperation } from "@backend/lib/collections/user-match/operations/user-match-getall-me.operation.js";
import { UserMatchLockOperation } from "@backend/lib/collections/user-match/operations/user-match-lock.operation.js";
import { UserMatchTransferItemOperation } from "@backend/lib/collections/user-match/operations/user-match-transfer-item.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

export const UserMatchCollection: BlCollection = {
  storage: BlStorage.UserMatches,
  endpoints: [
    {
      method: "post",
      operations: [
        {
          name: "generate",
          operation: new MatchGenerateOperation(),
          restriction: { permission: "admin" },
        },
        {
          name: "notify",
          operation: new MatchNotifyOperation(),
          restriction: { permission: "admin" },
        },
        {
          name: "transfer-item",
          operation: new UserMatchTransferItemOperation(),
          restriction: {
            permission: "customer",
          },
        },
        {
          name: "lock",
          operation: new UserMatchLockOperation(),
          restriction: {
            permission: "employee",
          },
        },
      ],
      restriction: {
        permission: "admin",
      },
    },
    {
      method: "getAll",
      operations: [
        {
          name: "me",
          operation: new GetMyUserMatchesOperation(),
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
