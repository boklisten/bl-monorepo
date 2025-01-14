import { User } from "@backend/collections/user/user";
import { UserModel } from "@backend/collections/user/user.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Request, Response } from "express";

export class UserDetailReadPermissionOperation implements Operation {
  constructor(
    private _userDetailStorage?: BlDocumentStorage<UserDetail>,
    private _userStorage?: BlDocumentStorage<User>,
    private _resHandler?: SEResponseHandler,
  ) {
    this._userDetailStorage = _userDetailStorage
      ? _userDetailStorage
      : new BlDocumentStorage(UserDetailModel);

    this._userStorage = _userStorage
      ? _userStorage
      : new BlDocumentStorage(UserModel);

    this._resHandler = _resHandler ? _resHandler : new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    _request?: Request,
    res?: Response,
  ): Promise<boolean> {
    // @ts-expect-error fixme: auto ignored
    const userDetail = await this._userDetailStorage.get(
      // @ts-expect-error fixme: auto ignored
      blApiRequest.documentId,
    );

    // @ts-expect-error fixme: auto ignored
    const users = await this._userStorage.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = users[0];

    // @ts-expect-error fixme: auto ignored
    this._resHandler.sendResponse(
      // @ts-expect-error fixme: auto ignored
      res,
      // @ts-expect-error fixme: auto ignored
      new BlapiResponse([{ permission: user.permission }]),
    );
    return true;
  }
}
