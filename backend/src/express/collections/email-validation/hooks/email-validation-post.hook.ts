import { EmailValidation } from "@backend/express/collections/email-validation/email-validation.js";
import EmailValidationHelper from "@backend/express/collections/email-validation/helpers/email-validation.helper.js";
import { Hook } from "@backend/express/hook/hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";

export class EmailValidationPostHook extends Hook {
  public override after(
    emailValidations: EmailValidation[],
  ): Promise<EmailValidation[]> {
    return new Promise((resolve, reject) => {
      const emailValidation = emailValidations[0];
      EmailValidationHelper
        // @ts-expect-error fixme: auto ignored
        .sendEmailValidationLink(emailValidation)
        .then(() => {
          // @ts-expect-error fixme: auto ignored
          resolve([emailValidation]);
        })
        .catch((sendValidationLinkError: BlError) => {
          reject(
            new BlError("could not send validation link").add(
              sendValidationLinkError,
            ),
          );
        });
    });
  }
}
