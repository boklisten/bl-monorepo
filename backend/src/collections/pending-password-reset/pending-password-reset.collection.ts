import { BlCollection } from "@backend/collections/bl-collection";
import { PendingPasswordResetPostHook } from "@backend/collections/pending-password-reset/hooks/pending-password-reset-post.hook";
import { ConfirmPendingPasswordResetOperation } from "@backend/collections/pending-password-reset/operations/confirm-pending-password-reset.operation";
import { PendingPasswordResetModel } from "@backend/collections/pending-password-reset/pending-password-reset.model";

export const PendingPasswordResetCollection: BlCollection = {
  model: PendingPasswordResetModel,
  endpoints: [
    {
      method: "post",
      hook: new PendingPasswordResetPostHook(),
    },
    {
      method: "patch",
      restriction: {
        permissions: ["admin"],
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
