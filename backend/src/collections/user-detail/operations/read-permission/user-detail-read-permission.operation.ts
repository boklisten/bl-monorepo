import { PermissionService } from "@backend/auth/permission/permission.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { User } from "@backend/collections/user/user";
import { UserSchema } from "@backend/collections/user/user.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
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
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);

    this._userStorage = _userStorage
      ? _userStorage
      : new BlDocumentStorage(BlCollectionName.Users, UserSchema);

    this._resHandler = _resHandler ? _resHandler : new SEResponseHandler();

    new PermissionService();
  }

  async run(
    blApiRequest: BlApiRequest,
    _request?: Request,
    res?: Response,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userDetail = await this._userDetailStorage.get(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      blApiRequest.documentId,
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const users = await this._userStorage.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = users[0];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._resHandler.sendResponse(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new BlapiResponse([{ permission: user.permission }]),
    );
    return true;
  }
}
