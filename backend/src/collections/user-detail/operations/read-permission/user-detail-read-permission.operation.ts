import { User } from "@backend/collections/user/user";
import { UserModel } from "@backend/collections/user/user.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlStorage } from "@backend/storage/blStorage";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Request, Response } from "express";

export class UserDetailReadPermissionOperation implements Operation {
  private userDetailStorage: BlStorage<UserDetail>;
  private userStorage: BlStorage<User>;
  private resHandler: SEResponseHandler;

  constructor(
    userDetailStorage?: BlStorage<UserDetail>,
    userStorage?: BlStorage<User>,
    resHandler?: SEResponseHandler,
  ) {
    this.userDetailStorage =
      userDetailStorage ?? new BlStorage(UserDetailModel);

    this.userStorage = userStorage ?? new BlStorage(UserModel);

    this.resHandler = resHandler ?? new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    request?: Request,
    res?: Response,
  ): Promise<boolean> {
    const userDetail = await this.userDetailStorage.get(
      // @ts-expect-error fixme: auto ignored
      blApiRequest.documentId,
    );

    const users = await this.userStorage.aggregate([
      { $match: { blid: userDetail.blid } },
    ]);
    const user = users[0];

    this.resHandler.sendResponse(
      // @ts-expect-error fixme: auto ignored
      res,
      // @ts-expect-error fixme: auto ignored
      new BlapiResponse([{ permission: user.permission }]),
    );
    return true;
  }
}
