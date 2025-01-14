import { BlCollectionName } from "@backend/collections/bl-collection";
import { EmailValidation } from "@backend/collections/email-validation/email-validation";
import { emailValidationSchema } from "@backend/collections/email-validation/email-validation.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { isNullish } from "@backend/helper/typescript-helpers";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { NextFunction, Request, Response } from "express";

export class EmailValidationConfirmOperation implements Operation {
  private _emailValidationStorage: BlDocumentStorage<EmailValidation>;
  private _resHandler: SEResponseHandler;
  private _userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(
    emailValidationStorage?: BlDocumentStorage<EmailValidation>,
    resHandler?: SEResponseHandler,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
  ) {
    this._emailValidationStorage = emailValidationStorage
      ? emailValidationStorage
      : new BlDocumentStorage(
          BlCollectionName.EmailValidations,
          emailValidationSchema,
        );
    this._resHandler = resHandler ? resHandler : new SEResponseHandler();
    this._userDetailStorage = userDetailStorage
      ? userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next?: NextFunction,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (isNullish(blApiRequest.documentId)) {
        return reject(new BlError("no documentId provided"));
      }

      this._emailValidationStorage
        .get(blApiRequest.documentId)
        .then((emailValidation: EmailValidation) => {
          this._userDetailStorage
            .update(emailValidation.userDetail, { emailConfirmed: true })
            .then(() => {
              this._resHandler.sendResponse(
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
              this._resHandler.sendErrorResponse(res, error);
              reject(error);
            });
        })
        .catch((getEmailValidationError: BlError) => {
          // @ts-expect-error fixme: auto ignored
          this._resHandler.sendErrorResponse(res, getEmailValidationError);
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
