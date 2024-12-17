import {
  BlCollection,
  BlCollectionName,
  BlEndpoint,
} from "@/collections/bl-collection";
import { emailValidationSchema } from "@/collections/email-validation/email-validation.schema";
import { EmailValidationPostHook } from "@/collections/email-validation/hooks/email-validation-post.hook";
import { EmailValidationConfirmOperation } from "@/collections/email-validation/operations/email-validation-confirm.operation";

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
