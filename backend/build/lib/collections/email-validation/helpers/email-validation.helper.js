import Messenger from "@backend/lib/messenger/messenger.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
function createAndSendEmailValidationLink(userDetailId) {
    return new Promise((resolve, reject) => {
        BlStorage.UserDetails.get(userDetailId)
            .then((userDetail) => {
            const emailValidation = {
                email: userDetail.email,
                userDetail: userDetail.id,
            };
            BlStorage.EmailValidations.add(emailValidation)
                .then((addedEmailValidation) => {
                Messenger.emailConfirmation(userDetail, addedEmailValidation.id)
                    .then(resolve)
                    .catch(reject);
            })
                .catch((addEmailValidationError) => {
                reject(new BlError("could not add emailValidation").add(addEmailValidationError));
            });
        })
            .catch((getUserDetailError) => {
            reject(new BlError(`userDetail "${userDetailId}" not found`).add(getUserDetailError));
        });
    });
}
function sendEmailValidationLink(emailValidation) {
    return new Promise((resolve, reject) => {
        BlStorage.UserDetails.get(emailValidation.userDetail)
            .catch((getUserDetailError) => {
            reject(new BlError(`userDetail "${emailValidation.userDetail}" not found`).add(getUserDetailError));
        })
            // @ts-expect-error fixme: auto ignored
            .then((userDetail) => Messenger.emailConfirmation(userDetail, emailValidation.id)
            .then(resolve)
            .catch(reject));
    });
}
const EmailValidationHelper = {
    createAndSendEmailValidationLink,
    sendEmailValidationLink,
};
export default EmailValidationHelper;
