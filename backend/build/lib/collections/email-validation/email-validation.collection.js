import { EmailValidationPostHook } from "@backend/lib/collections/email-validation/hooks/email-validation-post.hook.js";
import { EmailValidationConfirmOperation } from "@backend/lib/collections/email-validation/operations/email-validation-confirm.operation.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
export const EmailValidationCollection = {
    storage: BlStorage.EmailValidations,
    endpoints: [
        {
            method: "post",
            hook: new EmailValidationPostHook(),
            restriction: {
                permission: "customer",
                restricted: true,
            },
        },
        {
            method: "patch",
            restriction: {
                permission: "admin",
            },
            operations: [
                {
                    name: "confirm",
                    operation: new EmailValidationConfirmOperation(),
                },
            ],
        },
    ],
};
