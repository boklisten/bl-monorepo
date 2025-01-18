import { BlCollection } from "@backend/collections/bl-collection";
import { MatchGenerateOperation } from "@backend/collections/user-match/operations/match-generate.operation";
import { MatchNotifyOperation } from "@backend/collections/user-match/operations/match-notify.operation";
import { GetMyUserMatchesOperation } from "@backend/collections/user-match/operations/user-match-getall-me.operation";
import { UserMatchLockOperation } from "@backend/collections/user-match/operations/user-match-lock.operation";
import { UserMatchTransferItemOperation } from "@backend/collections/user-match/operations/user-match-transfer-item.operation";
import { BlStorage } from "@backend/storage/bl-storage";

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
