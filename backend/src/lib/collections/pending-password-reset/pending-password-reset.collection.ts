import { PendingPasswordResetPostHook } from "@backend/lib/collections/pending-password-reset/hooks/pending-password-reset-post.hook.js";
import { ConfirmPendingPasswordResetOperation } from "@backend/lib/collections/pending-password-reset/operations/confirm-pending-password-reset.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

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
