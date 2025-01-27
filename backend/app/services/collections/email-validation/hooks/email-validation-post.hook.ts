import { EmailValidation } from "#services/collections/email-validation/email-validation";
import EmailValidationHelper from "#services/collections/email-validation/helpers/email-validation.helper";
import { Hook } from "#services/hook/hook";
import { BlError } from "#shared/bl-error/bl-error";

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
