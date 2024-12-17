import { BlapiResponse, BlError, UserDetail } from "@boklisten/bl-model";
import { NextFunction, Request, Response } from "express";

import { SystemUser } from "@/auth/permission/permission.service";
import { BlCollectionName } from "@/collections/bl-collection";
import { EmailValidation } from "@/collections/email-validation/email-validation";
import { emailValidationSchema } from "@/collections/email-validation/email-validation.schema";
import { userDetailSchema } from "@/collections/user-detail/user-detail.schema";
import { isNullish } from "@/helper/typescript-helpers";
import { Operation } from "@/operation/operation";
import { BlApiRequest } from "@/request/bl-api-request";
import { SEResponseHandler } from "@/response/se.response.handler";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req?: Request,
    res?: Response,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
            .update(
              emailValidation.userDetail,
              { emailConfirmed: true },
              new SystemUser(),
            )
            .then(() => {
              this._resHandler.sendResponse(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                res,
                new BlapiResponse([{ confirmed: true }]),
              );
              resolve(true);
            })
            .catch((updateUserDetailError: BlError) => {
              const err = new BlError(
                `could not update userDetail "${emailValidation.id}" with emailConfirmed true`,
              ).add(updateUserDetailError);

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              this._resHandler.sendErrorResponse(res, err);
              reject(err);
            });
        })
        .catch((getEmailValidationError: BlError) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
