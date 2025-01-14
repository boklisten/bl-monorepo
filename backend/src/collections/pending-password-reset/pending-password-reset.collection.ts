import {
  BlCollection,
  BlCollectionName,
} from "@backend/collections/bl-collection";
import { PendingPasswordResetPostHook } from "@backend/collections/pending-password-reset/hooks/pending-password-reset-post.hook";
import { ConfirmPendingPasswordResetOperation } from "@backend/collections/pending-password-reset/operations/confirm-pending-password-reset.operation";
import { pendingPasswordResetSchema } from "@backend/collections/pending-password-reset/pending-password-reset.schema";

export const PendingPasswordResetCollection: BlCollection = {
  collectionName: BlCollectionName.PendingPasswordResets,
  mongooseSchema: pendingPasswordResetSchema,
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
