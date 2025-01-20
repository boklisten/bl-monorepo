import { BlCollection } from "@backend/collections/bl-collection.js";
import { PendingPasswordResetPostHook } from "@backend/collections/pending-password-reset/hooks/pending-password-reset-post.hook.js";
import { ConfirmPendingPasswordResetOperation } from "@backend/collections/pending-password-reset/operations/confirm-pending-password-reset.operation.js";
import { BlStorage } from "@backend/storage/bl-storage.js";

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
