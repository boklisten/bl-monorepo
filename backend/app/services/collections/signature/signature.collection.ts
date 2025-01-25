import { SignatureGetIdHook } from "#services/collections/signature/hooks/signature.get-id.hook";
import { SignaturePostHook } from "#services/collections/signature/hooks/signature.post.hook";
import { CheckGuardianSignatureOperation } from "#services/collections/signature/operations/check-guardian-signature.operation";
import { GuardianSignatureOperation } from "#services/collections/signature/operations/guardian-signature.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

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
