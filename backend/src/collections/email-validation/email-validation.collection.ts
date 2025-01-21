import { EmailValidationPostHook } from "@backend/collections/email-validation/hooks/email-validation-post.hook.js";
import { EmailValidationConfirmOperation } from "@backend/collections/email-validation/operations/email-validation-confirm.operation.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlCollection } from "@backend/types/bl-collection.js";

export const EmailValidationCollection: BlCollection = {
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
