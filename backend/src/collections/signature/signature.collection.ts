import { BlCollection } from "@backend/collections/bl-collection";
import { SignatureGetIdHook } from "@backend/collections/signature/hooks/signature.get-id.hook";
import { SignaturePostHook } from "@backend/collections/signature/hooks/signature.post.hook";
import { CheckGuardianSignatureOperation } from "@backend/collections/signature/operations/check-guardian-signature.operation";
import { GuardianSignatureOperation } from "@backend/collections/signature/operations/guardian-signature.operation";
import { BlStorage } from "@backend/storage/bl-storage";

export const SignatureCollection: BlCollection = {
  storage: BlStorage.Signatures,
  documentPermission: {
    viewableForPermission: "employee",
  },
  endpoints: [
    {
      method: "post",
      restriction: {
        permissions: ["customer", "employee", "manager", "admin"],
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
        permissions: ["customer", "employee", "manager", "admin"],
      },
      hook: new SignatureGetIdHook(),
    },
  ],
};
