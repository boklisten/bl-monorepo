import { EmailValidationPostHook } from "#services/collections/email-validation/hooks/email-validation-post.hook";
import { EmailValidationConfirmOperation } from "#services/collections/email-validation/operations/email-validation-confirm.operation";
import { BlStorage } from "#services/storage/bl-storage";
import { BlCollection } from "#services/types/bl-collection";

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
