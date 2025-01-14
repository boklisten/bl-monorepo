import { PermissionService } from "@backend/auth/permission/permission.service";
import { UserHandler } from "@backend/auth/user/user.handler";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { LocalLoginModel } from "@backend/collections/local-login/local-login.model";
import { User } from "@backend/collections/user/user";
import { UserModel } from "@backend/collections/user/user.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { isNotNullish, isNullish } from "@backend/helper/typescript-helpers";
import { Operation } from "@backend/operation/operation";
import { BlApiRequest } from "@backend/request/bl-api-request";
import { SEResponseHandler } from "@backend/response/se.response.handler";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { BlapiResponse } from "@shared/blapi-response/blapi-response";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import { Request, Response } from "express";
import isEmail from "validator/lib/isEmail";

export class UserDetailChangeEmailOperation implements Operation {
  private _userDetailStorage: BlDocumentStorage<UserDetail>;
  private _userStorage: BlDocumentStorage<User>;
  private _localLoginStorage: BlDocumentStorage<LocalLogin>;
  private _userHandler: UserHandler;
  private _resHandler: SEResponseHandler;

  constructor(
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    userStorage?: BlDocumentStorage<User>,
    localLoginStorage?: BlDocumentStorage<LocalLogin>,
    userHandler?: UserHandler,
    resHandler?: SEResponseHandler,
  ) {
    this._userDetailStorage =
      userDetailStorage ?? new BlDocumentStorage(UserDetailModel);
    this._userStorage = userStorage ?? new BlDocumentStorage(UserModel);
    this._localLoginStorage =
      localLoginStorage ?? new BlDocumentStorage(LocalLoginModel);
    this._userHandler = userHandler ?? new UserHandler();
    this._resHandler = resHandler ?? new SEResponseHandler();
  }

  async run(
    blApiRequest: BlApiRequest,
    _request?: Request,
    res?: Response,
  ): Promise<boolean> {
    // @ts-expect-error fixme: auto ignored
    const emailChange = blApiRequest.data["email"];

    this.validateEmail(emailChange);

    const userDetail = await this._userDetailStorage.get(
      // @ts-expect-error fixme: auto ignored
      blApiRequest.documentId,
    );

    const user = await this.getUser(userDetail.email, userDetail.blid);
    const localLogin = await this.getLocalLogin(userDetail.email);

    // @ts-expect-error fixme: auto ignored
    this.validatePermission(blApiRequest.user.permission, user.permission);
    await this.checkIfAlreadyAdded(emailChange);

    await this._userDetailStorage.update(
      userDetail.id,
      { email: emailChange },

      // @ts-expect-error fixme: auto ignored
      blApiRequest.user,
    );

    await this._userStorage.update(
      user.id,
      { username: emailChange },

      // @ts-expect-error fixme: auto ignored
      blApiRequest.user,
    );

    await this._localLoginStorage.update(
      localLogin.id,
      { username: emailChange },

      // @ts-expect-error fixme: auto ignored
      blApiRequest.user,
    );

    // @ts-expect-error fixme: auto ignored
    this._resHandler.sendResponse(res, new BlapiResponse([{ success: true }]));
    return true;
  }

  private async checkIfAlreadyAdded(email: string): Promise<boolean> {
    let alreadyAddedUser;

    try {
      alreadyAddedUser = await this._userHandler.getByUsername(email);
      // eslint-disable-next-line no-empty
    } catch {}

    if (isNotNullish(alreadyAddedUser)) {
      throw new BlError("email is already present in database").code(701);
    }

    return false;
  }

  private validatePermission(
    // @ts-expect-error fixme: auto ignored
    userPermission,

    // @ts-expect-error fixme: auto ignored
    permissionToEmailChangeUser,
  ): boolean {
    if (
      !PermissionService.isPermissionOver(
        userPermission,
        permissionToEmailChangeUser,
      )
    ) {
      throw new BlError("no access to change email");
    }
    return true;
  }

  private async getUser(email: string, blid: string): Promise<User> {
    const users = await this._userStorage.aggregate([
      { $match: { username: email, blid: blid } },
    ]);

    // @ts-expect-error fixme: auto ignored
    return users[0];
  }

  private async getLocalLogin(username: string): Promise<LocalLogin> {
    const localLogins = await this._localLoginStorage.aggregate([
      { $match: { username: username } },
    ]);

    // @ts-expect-error fixme: auto ignored
    return localLogins[0];
  }

  private validateEmail(email: string) {
    if (isNullish(email) || !isEmail(email)) {
      throw new BlError("email is not valid").code(701);
    }
  }
}
