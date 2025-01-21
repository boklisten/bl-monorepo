import { SignatureGetIdHook } from "@backend/collections/signature/hooks/signature.get-id.hook.js";
import { SignaturePostHook } from "@backend/collections/signature/hooks/signature.post.hook.js";
import { CheckGuardianSignatureOperation } from "@backend/collections/signature/operations/check-guardian-signature.operation.js";
import { GuardianSignatureOperation } from "@backend/collections/signature/operations/guardian-signature.operation.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

export const SignatureCollection: BlCollection = {
  storage: BlStorage.Signatures,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "post",
      restriction: {
        permission: "customer",
        restricted: false,
      },
      hook: new SignaturePostHook(),
      operations: [
        {
          name: "guardian",
          operation: new GuardianSignatureOperation(),
        },
        {
          name: "check-guardian-signature",
          operation: new CheckGuardianSignatureOperation(),
        },
      ],
    },
    {
      method: "getId",
      restriction: {
        permission: "customer",
      },
      hook: new SignatureGetIdHook(),
    },
  ],
};
