import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@/collections/bl-collection";
import { PendingPasswordResetPostHook } from "@/collections/pending-password-reset/hooks/pending-password-reset-post.hook";
import { ConfirmPendingPasswordResetOperation } from "@/collections/pending-password-reset/operations/confirm-pending-password-reset.operation";
import { pendingPasswordResetSchema } from "@/collections/pending-password-reset/pending-password-reset.schema";

export class PendingPasswordResetCollection implements BlCollection {
  public collectionName = BlCollectionName.PendingPasswordResets;
  public mongooseSchema = pendingPasswordResetSchema;
  public endpoints: BlEndpoint[] = [
    {
      method: "post",
      hook: new PendingPasswordResetPostHook(),
    },
    {
      method: "patch",
      restriction: {
        permissions: ["super"],
      },
      operations: [
        {
          name: "confirm",
          operation: new ConfirmPendingPasswordResetOperation(),
        },
      ],
    },
  ];
}
