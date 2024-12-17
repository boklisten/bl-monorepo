import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@backend/collections/bl-collection";
import { emailValidationSchema } from "@backend/collections/email-validation/email-validation.schema";
import { EmailValidationPostHook } from "@backend/collections/email-validation/hooks/email-validation-post.hook";
import { EmailValidationConfirmOperation } from "@backend/collections/email-validation/operations/email-validation-confirm.operation";

export class EmailValidationCollection implements BlCollection {
  public collectionName = BlCollectionName.EmailValidations;
  public mongooseSchema = emailValidationSchema;
  public endpoints: BlEndpoint[] = [
    {
      method: "post",
      hook: new EmailValidationPostHook(),
      restriction: {
        permissions: ["customer", "employee", "manager", "admin", "super"],
        restricted: true,
      },
    },
    {
      method: "patch",
      restriction: {
        permissions: ["super"],
      },
      operations: [
        {
          name: "confirm",
          operation: new EmailValidationConfirmOperation(),
        },
      ],
    },
  ];
}
