import {
  BlCollection,
  BlCollectionName,
  BlDocumentPermission,
  BlEndpoint,
} from "@/collections/bl-collection";
import { SignatureGetIdHook } from "@/collections/signature/hooks/signature.get-id.hook";
import { SignaturePostHook } from "@/collections/signature/hooks/signature.post.hook";
import { CheckGuardianSignatureOperation } from "@/collections/signature/operations/check-guardian-signature.operation";
import { GuardianSignatureOperation } from "@/collections/signature/operations/guardian-signature.operation";
import { signatureSchema } from "@/collections/signature/signature.schema";

export class SignatureCollection implements BlCollection {
  public collectionName = BlCollectionName.Signatures;
  public mongooseSchema = signatureSchema;
  documentPermission: BlDocumentPermission = {
    viewableForPermission: "employee",
  };

  public endpoints: BlEndpoint[] = [
    {
      method: "post",
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
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
        permissions: ["customer", "employee", "manager", "admin", "super"],
      },
      hook: new SignatureGetIdHook(),
    },
  ];
}
