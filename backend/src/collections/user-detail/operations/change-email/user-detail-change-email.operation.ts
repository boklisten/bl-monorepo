import { PermissionService } from "@backend/auth/permission/permission.service";
import { UserHandler } from "@backend/auth/user/user.handler";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { localLoginSchema } from "@backend/collections/local-login/local-login.schema";
import { User } from "@backend/collections/user/user";
import { UserSchema } from "@backend/collections/user/user.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
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
  private _permissionService: PermissionService;

  constructor(
    private _userDetailStorage?: BlDocumentStorage<UserDetail>,
    private _userStorage?: BlDocumentStorage<User>,
    private _localLoginStorage?: BlDocumentStorage<LocalLogin>,
    private _userHandler?: UserHandler,
    private _resHandler?: SEResponseHandler,
  ) {
    this._userDetailStorage = _userDetailStorage
      ? _userDetailStorage
      : new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._userStorage = _userStorage
      ? _userStorage
      : new BlDocumentStorage(BlCollectionName.Users, UserSchema);
    this._localLoginStorage = _localLoginStorage
      ? _localLoginStorage
      : new BlDocumentStorage(BlCollectionName.LocalLogins, localLoginSchema);
    this._userHandler = _userHandler ? _userHandler : new UserHandler();
    this._resHandler = _resHandler ? _resHandler : new SEResponseHandler();
    this._permissionService = new PermissionService();
  }

  async run(
    blApiRequest: BlApiRequest,
    _request?: Request,
    res?: Response,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const emailChange = blApiRequest.data["email"];

    this.validateEmail(emailChange);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userDetail = await this._userDetailStorage.get(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      blApiRequest.documentId,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = await this.getUser(userDetail.email, userDetail.blid);
    const localLogin = await this.getLocalLogin(userDetail.email);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.validatePermission(blApiRequest.user.permission, user.permission);
    await this.checkIfAlreadyAdded(emailChange);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this._userDetailStorage.update(
      userDetail.id,
      { email: emailChange },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      blApiRequest.user,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this._userStorage.update(
      user.id,
      { username: emailChange },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      blApiRequest.user,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this._localLoginStorage.update(
      localLogin.id,
      { username: emailChange },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      blApiRequest.user,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._resHandler.sendResponse(res, new BlapiResponse([{ success: true }]));
    return true;
  }

  private async checkIfAlreadyAdded(email: string): Promise<boolean> {
    let alreadyAddedUser;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      alreadyAddedUser = await this._userHandler.getByUsername(email);
      // eslint-disable-next-line no-empty
    } catch {}

    if (isNotNullish(alreadyAddedUser)) {
      throw new BlError("email is already present in database").code(701);
    }

    return false;
  }

  private validatePermission(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    userPermission,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    permissionToEmailChangeUser,
  ): boolean {
    if (
      !this._permissionService.isPermissionOver(
        userPermission,
        permissionToEmailChangeUser,
      )
    ) {
      throw new BlError("no access to change email");
    }
    return true;
  }

  private async getUser(email: string, blid: string): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const users = await this._userStorage.aggregate([
      { $match: { username: email, blid: blid } },
    ]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return users[0];
  }

  private async getLocalLogin(username: string): Promise<LocalLogin> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const localLogins = await this._localLoginStorage.aggregate([
      { $match: { username: username } },
    ]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return localLogins[0];
  }

  private validateEmail(email: string) {
    if (isNullish(email) || !isEmail(email)) {
      throw new BlError("email is not valid").code(701);
    }
  }
}
