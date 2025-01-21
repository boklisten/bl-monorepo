import { EmailValidation } from "@backend/collections/email-validation/email-validation.js";
import Messenger from "@backend/messenger/messenger.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";

function createAndSendEmailValidationLink(userDetailId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    BlStorage.UserDetails.get(userDetailId)
      .then((userDetail: UserDetail) => {
        const emailValidation = {
          email: userDetail.email,
          userDetail: userDetail.id,
        } as EmailValidation;
        BlStorage.EmailValidations.add(emailValidation)
          .then((addedEmailValidation: EmailValidation) => {
            Messenger.emailConfirmation(userDetail, addedEmailValidation.id)
              .then(resolve)
              .catch(reject);
          })
          .catch((addEmailValidationError: BlError) => {
            reject(
              new BlError("could not add emailValidation").add(
                addEmailValidationError,
              ),
            );
          });
      })
      .catch((getUserDetailError: BlError) => {
        reject(
          new BlError(`userDetail "${userDetailId}" not found`).add(
            getUserDetailError,
          ),
        );
      });
  });
}

function sendEmailValidationLink(
  emailValidation: EmailValidation,
): Promise<void> {
  return new Promise((resolve, reject) => {
    BlStorage.UserDetails.get(emailValidation.userDetail)
      .catch((getUserDetailError: BlError) => {
        reject(
          new BlError(
            `userDetail "${emailValidation.userDetail}" not found`,
          ).add(getUserDetailError),
        );
      })

      // @ts-expect-error fixme: auto ignored
      .then((userDetail: UserDetail) =>
        Messenger.emailConfirmation(userDetail, emailValidation.id)
          .then(resolve)
          .catch(reject),
      );
  });
}

const EmailValidationHelper = {
  createAndSendEmailValidationLink,
  sendEmailValidationLink,
};
export default EmailValidationHelper;
