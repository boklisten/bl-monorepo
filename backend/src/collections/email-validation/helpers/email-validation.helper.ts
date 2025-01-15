import { EmailValidation } from "@backend/collections/email-validation/email-validation";
import { EmailValidationModel } from "@backend/collections/email-validation/email-validation.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Messenger } from "@backend/messenger/messenger";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class EmailValidationHelper {
  private messenger: Messenger;
  private userDetailStorage: BlStorage<UserDetail>;
  private emailValidationStorage: BlStorage<EmailValidation>;

  constructor(
    messenger?: Messenger,
    userDetailStorage?: BlStorage<UserDetail>,
    emailValidationStorage?: BlStorage<EmailValidation>,
  ) {
    this.messenger = messenger ?? new Messenger();
    this.userDetailStorage =
      userDetailStorage ?? new BlStorage(UserDetailModel);
    this.emailValidationStorage =
      emailValidationStorage ?? new BlStorage(EmailValidationModel);
  }

  public createAndSendEmailValidationLink(userDetailId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userDetailStorage
        .get(userDetailId)
        .then((userDetail: UserDetail) => {
          const emailValidation = {
            email: userDetail.email,
            userDetail: userDetail.id,
          } as EmailValidation;
          this.emailValidationStorage
            .add(emailValidation)
            .then((addedEmailValidation: EmailValidation) => {
              this.messenger
                .emailConfirmation(userDetail, addedEmailValidation.id)
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

  public sendEmailValidationLink(
    emailValidation: EmailValidation,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userDetailStorage
        .get(emailValidation.userDetail)
        .catch((getUserDetailError: BlError) => {
          reject(
            new BlError(
              `userDetail "${emailValidation.userDetail}" not found`,
            ).add(getUserDetailError),
          );
        })

        // @ts-expect-error fixme: auto ignored
        .then((userDetail: UserDetail) =>
          this.messenger
            .emailConfirmation(userDetail, emailValidation.id)
            .then(resolve)
            .catch(reject),
        );
    });
  }
}
