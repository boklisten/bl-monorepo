import { BlCollectionName } from "@backend/collections/bl-collection";
import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Request, Response } from "express";

export class UserDetailValidOperation implements Operation {
  private _userDetailStorage: BlDocumentStorage<UserDetail>;
  private _userDetailHelper: UserDetailHelper;
  private _resHandler: SEResponseHandler;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    resHandler?: SEResponseHandler,
  ) {
    this._userDetailStorage = userDetailStorage
      ? userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._resHandler = resHandler ? resHandler : new SEResponseHandler();
    this._userDetailHelper = new UserDetailHelper();
  }

  async run(
    blApiRequest: BlApiRequest,
    _request?: Request,
    res?: Response,
  ): Promise<boolean> {
    try {
      const userDetail = await this._userDetailStorage.get(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        blApiRequest.documentId,
      );

      const invalidUserDetailFields =
        this._userDetailHelper.getInvalidUserDetailFields(userDetail);

      if (invalidUserDetailFields.length <= 0) {
        this._resHandler.sendResponse(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          res,
          new BlapiResponse([{ valid: true }]),
        );
      } else {
        this._resHandler.sendResponse(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          res,
          new BlapiResponse([
            { valid: false, invalidFields: invalidUserDetailFields },
          ]),
        );
      }

      return true;
    } catch (error) {
      const responseError: BlError = new BlError(
        "userDetail could not be validated",
      );

      if (error instanceof BlError) {
        responseError.add(error);
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._resHandler.sendErrorResponse(res, responseError);

      throw responseError;
    }
  }
}
