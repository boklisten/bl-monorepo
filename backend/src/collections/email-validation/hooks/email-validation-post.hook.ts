import { AccessToken, BlError } from "@boklisten/bl-model";

import { EmailValidation } from "@/collections/email-validation/email-validation";
import { EmailValidationHelper } from "@/collections/email-validation/helpers/email-validation.helper";
import { Hook } from "@/hook/hook";

export class EmailValidationPostHook extends Hook {
  private _emailValidationHelper: EmailValidationHelper;

  constructor(emailValidationHelper?: EmailValidationHelper) {
    super();
    this._emailValidationHelper =
      emailValidationHelper ?? new EmailValidationHelper();
  }

  public override after(
    emailValidations: EmailValidation[],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken?: AccessToken,
  ): Promise<EmailValidation[]> {
    return new Promise((resolve, reject) => {
      const emailValidation = emailValidations[0];

      this._emailValidationHelper
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .sendEmailValidationLink(emailValidation)
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
