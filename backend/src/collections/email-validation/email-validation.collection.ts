import {
  BlCollection,
  BlCollectionName,
} from "@backend/collections/bl-collection";
import { emailValidationSchema } from "@backend/collections/email-validation/email-validation.schema";
import { EmailValidationPostHook } from "@backend/collections/email-validation/hooks/email-validation-post.hook";
import { EmailValidationConfirmOperation } from "@backend/collections/email-validation/operations/email-validation-confirm.operation";

export const EmailValidationCollection: BlCollection = {
  collectionName: BlCollectionName.EmailValidations,
  mongooseSchema: emailValidationSchema,
  endpoints: [
    {
      method: "post",
      hook: new EmailValidationPostHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin"],
        restricted: true,
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["admin"],
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
