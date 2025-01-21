import { EmailValidation } from "@backend/collections/email-validation/email-validation.js";
import { isNullish } from "@backend/helper/typescript-helpers.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Request, Response } from "express";

export class EmailValidationConfirmOperation implements Operation {
  run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (isNullish(blApiRequest.documentId)) {
        return reject(new BlError("no documentId provided"));
      }

      BlStorage.EmailValidations.get(blApiRequest.documentId)
        .then((emailValidation: EmailValidation) => {
          BlStorage.UserDetails.update(emailValidation.userDetail, {
            emailConfirmed: true,
          })
            .then(() => {
              BlResponseHandler.sendResponse(
                res,
                new BlapiResponse([{ confirmed: true }]),
              );
              resolve(true);
            })
            .catch((updateUserDetailError: BlError) => {
              const error = new BlError(
                `could not update userDetail "${emailValidation.id}" with emailConfirmed true`,
              ).add(updateUserDetailError);

              BlResponseHandler.sendErrorResponse(res, error);
              reject(error);
            });
        })
        .catch((getEmailValidationError: BlError) => {
          BlResponseHandler.sendErrorResponse(res, getEmailValidationError);
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
