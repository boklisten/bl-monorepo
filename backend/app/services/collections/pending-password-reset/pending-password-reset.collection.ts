import { PendingPasswordResetPostHook } from "#services/collections/pending-password-reset/hooks/pending-password-reset-post.hook";
import { ConfirmPendingPasswordResetOperation } from "#services/collections/pending-password-reset/operations/confirm-pending-password-reset.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

export const PendingPasswordResetCollection: BlCollection = {
  storage: BlStorage.PendingPasswordResets,
  endpoints: [
    {
      method: "post",
      hook: new PendingPasswordResetPostHook(),
    },
    {
      method: "patch",
      restriction: {
        permission: "admin",
      },
      operations: [
        {
          name: "confirm",
          operation: new ConfirmPendingPasswordResetOperation(),
        },
      ],
    },
  ],
};
