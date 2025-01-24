import EmailValidationHelper from "@backend/lib/collections/email-validation/helpers/email-validation.helper.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
export class EmailValidationPostHook extends Hook {
    after(emailValidations) {
        return new Promise((resolve, reject) => {
            const emailValidation = emailValidations[0];
            EmailValidationHelper
                // @ts-expect-error fixme: auto ignored
                .sendEmailValidationLink(emailValidation)
                .then(() => {
                // @ts-expect-error fixme: auto ignored
                resolve([emailValidation]);
            })
                .catch((sendValidationLinkError) => {
                reject(new BlError("could not send validation link").add(sendValidationLinkError));
            });
        });
    }
}
