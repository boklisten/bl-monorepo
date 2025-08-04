import { SignatureGetIdHook } from "#services/legacy/collections/signature/hooks/signature.get-id.hook";
import { SignaturePostHook } from "#services/legacy/collections/signature/hooks/signature.post.hook";
import { CheckGuardianSignatureOperation } from "#services/legacy/collections/signature/operations/check-guardian-signature.operation";
import { GuardianSignatureOperation } from "#services/legacy/collections/signature/operations/guardian-signature.operation";
import { StorageService } from "#services/storage_service";
import { BlCollection } from "#types/bl-collection";

export const SignatureCollection: BlCollection = {
  storage: StorageService.Signatures,
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
