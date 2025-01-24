import { SignatureGetIdHook } from "@backend/lib/collections/signature/hooks/signature.get-id.hook.js";
import { SignaturePostHook } from "@backend/lib/collections/signature/hooks/signature.post.hook.js";
import { CheckGuardianSignatureOperation } from "@backend/lib/collections/signature/operations/check-guardian-signature.operation.js";
import { GuardianSignatureOperation } from "@backend/lib/collections/signature/operations/guardian-signature.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const SignatureCollection = {
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
