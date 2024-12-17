import { BlError, UserDetail } from "@boklisten/bl-model";

import { SystemUser } from "@/auth/permission/permission.service";
import { BlCollectionName } from "@/collections/bl-collection";
import { EmailValidation } from "@/collections/email-validation/email-validation";
import { emailValidationSchema } from "@/collections/email-validation/email-validation.schema";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";
import { Messenger } from "@/messenger/messenger";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class EmailValidationHelper {
  private readonly _messenger: Messenger;
  private readonly _userDetailStorage: BlDocumentStorage<UserDetail>;
  private readonly _emailValidationStorage?: BlDocumentStorage<EmailValidation>;

  constructor(
    messenger?: Messenger,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    emailValidationStorage?: BlDocumentStorage<EmailValidation>,
  ) {
    this._messenger = messenger ?? new Messenger();
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._emailValidationStorage =
      emailValidationStorage ??
      new BlDocumentStorage(
        BlCollectionName.EmailValidations,
        emailValidationSchema,
      );
  }

  public createAndSendEmailValidationLink(userDetailId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._userDetailStorage
        .get(userDetailId)
        .then((userDetail: UserDetail) => {
          const emailValidation = {
            email: userDetail.email,
            userDetail: userDetail.id,
          } as EmailValidation;

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._emailValidationStorage
            .add(emailValidation, new SystemUser())
            .then((addedEmailValidation: EmailValidation) => {
              this._messenger
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
      this._userDetailStorage
        .get(emailValidation.userDetail)
        .catch((getUserDetailError: BlError) => {
          reject(
            new BlError(
              `userDetail "${emailValidation.userDetail}" not found`,
            ).add(getUserDetailError),
          );
        })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .then((userDetail: UserDetail) =>
          this._messenger
            .emailConfirmation(userDetail, emailValidation.id)
            .then(resolve)
            .catch(reject),
        );
    });
  }
}
