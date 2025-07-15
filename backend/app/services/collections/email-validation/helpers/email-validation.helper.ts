import { EmailValidation } from "#services/collections/email-validation/email-validation";
import Messenger from "#services/messenger/messenger";
import { BlStorage } from "#services/storage/bl-storage";

async function createAndSendEmailValidationLink(
  email: string,
  userDetailId: string,
) {
  const addedEmailValidation = await BlStorage.EmailValidations.add({
    email,
    userDetail: userDetailId,
  });
  await Messenger.emailConfirmation(email, addedEmailValidation.id);
}

async function sendEmailValidationLink(emailValidation: EmailValidation) {
  const userDetail = await BlStorage.UserDetails.get(
    emailValidation.userDetail,
  );
  await Messenger.emailConfirmation(userDetail.email, emailValidation.id);
}

const EmailValidationHelper = {
  createAndSendEmailValidationLink,
  sendEmailValidationLink,
};
export default EmailValidationHelper;
