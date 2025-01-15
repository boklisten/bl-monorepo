import { EmailValidation } from "@backend/collections/email-validation/email-validation";
import { EmailValidationModel } from "@backend/collections/email-validation/email-validation.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { isNullish } from "@backend/helper/typescript-helpers";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Request, Response } from "express";

export class EmailValidationConfirmOperation implements Operation {
  private emailValidationStorage: BlStorage<EmailValidation>;
  private resHandler: SEResponseHandler;
  private userDetailStorage: BlStorage<UserDetail>;

  constructor(
    emailValidationStorage?: BlStorage<EmailValidation>,
    resHandler?: SEResponseHandler,
    userDetailStorage?: BlStorage<UserDetail>,
  ) {
    this.emailValidationStorage =
      emailValidationStorage ?? new BlStorage(EmailValidationModel);
    this.resHandler = resHandler ?? new SEResponseHandler();
    this.userDetailStorage =
      userDetailStorage ?? new BlStorage(UserDetailModel);
  }

  run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (isNullish(blApiRequest.documentId)) {
        return reject(new BlError("no documentId provided"));
      }

      this.emailValidationStorage
        .get(blApiRequest.documentId)
        .then((emailValidation: EmailValidation) => {
          this.userDetailStorage
            .update(emailValidation.userDetail, { emailConfirmed: true })
            .then(() => {
              this.resHandler.sendResponse(
                // @ts-expect-error fixme: auto ignored
                res,
                new BlapiResponse([{ confirmed: true }]),
              );
              resolve(true);
            })
            .catch((updateUserDetailError: BlError) => {
              const error = new BlError(
                `could not update userDetail "${emailValidation.id}" with emailConfirmed true`,
              ).add(updateUserDetailError);

              // @ts-expect-error fixme: auto ignored
              this.resHandler.sendErrorResponse(res, error);
              reject(error);
            });
        })
        .catch((getEmailValidationError: BlError) => {
          // @ts-expect-error fixme: auto ignored
          this.resHandler.sendErrorResponse(res, getEmailValidationError);
          reject(
            new BlError(
              `emailValidation "${blApiRequest.documentId}" not found`,
            )
              .code(702)
              .add(getEmailValidationError),
          );
        });
    });
  }
}
