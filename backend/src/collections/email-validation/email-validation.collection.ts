import { BlCollection } from "@backend/collections/bl-collection";
import { EmailValidationPostHook } from "@backend/collections/email-validation/hooks/email-validation-post.hook";
import { EmailValidationConfirmOperation } from "@backend/collections/email-validation/operations/email-validation-confirm.operation";
import { BlStorage } from "@backend/storage/bl-storage";

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
