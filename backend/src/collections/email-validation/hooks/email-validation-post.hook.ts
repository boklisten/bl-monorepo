import { EmailValidation } from "@backend/collections/email-validation/email-validation";
import { EmailValidationHelper } from "@backend/collections/email-validation/helpers/email-validation.helper";
import { Hook } from "@backend/hook/hook";
import { BlError } from "@shared/bl-error/bl-error";

export class EmailValidationPostHook extends Hook {
  private emailValidationHelper: EmailValidationHelper;

  constructor(emailValidationHelper?: EmailValidationHelper) {
    super();
    this.emailValidationHelper =
      emailValidationHelper ?? new EmailValidationHelper();
  }

  public override after(
    emailValidations: EmailValidation[],
  ): Promise<EmailValidation[]> {
    return new Promise((resolve, reject) => {
      const emailValidation = emailValidations[0];

      this.emailValidationHelper

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
