import { PermissionService } from "@backend/auth/permission.service.js";
import UserHandler from "@backend/auth/user/user.handler.js";
import { isNotNullish, isNullish } from "@backend/helper/typescript-helpers.js";
import BlResponseHandler from "@backend/response/bl-response.handler.js";
import { BlStorage } from "@backend/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { LocalLogin } from "@backend/types/local-login.js";
import { Operation } from "@backend/types/operation.js";
import { User } from "@backend/types/user.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";
import { Request, Response } from "express";
import validator from "validator";

export class UserDetailChangeEmailOperation implements Operation {
  async run(
    blApiRequest: BlApiRequest,
    request: Request,
    res: Response,
  ): Promise<boolean> {
    // @ts-expect-error fixme: auto ignored
    const emailChange = blApiRequest.data["email"];

    this.validateEmail(emailChange);

    const userDetail = await BlStorage.UserDetails.get(blApiRequest.documentId);

    const user = await this.getUser(userDetail.email, userDetail.blid);
    const localLogin = await this.getLocalLogin(userDetail.email);

    // @ts-expect-error fixme: auto ignored
    this.validatePermission(blApiRequest.user.permission, user.permission);
    await this.checkIfAlreadyAdded(emailChange);

    await BlStorage.UserDetails.update(
      userDetail.id,
      { email: emailChange },

      // @ts-expect-error fixme: auto ignored
      blApiRequest.user,
    );

    await BlStorage.Users.update(
      user.id,
      { username: emailChange },

      // @ts-expect-error fixme: auto ignored
      blApiRequest.user,
    );

    await BlStorage.LocalLogins.update(
      localLogin.id,
      { username: emailChange },

      // @ts-expect-error fixme: auto ignored
      blApiRequest.user,
    );

    BlResponseHandler.sendResponse(res, new BlapiResponse([{ success: true }]));
    return true;
  }

  private async checkIfAlreadyAdded(email: string): Promise<boolean> {
    let alreadyAddedUser;

    try {
      alreadyAddedUser = await UserHandler.getByUsername(email);
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
    const users = await BlStorage.Users.aggregate([
      { $match: { username: email, blid: blid } },
    ]);

    // @ts-expect-error fixme: auto ignored
    return users[0];
  }

  private async getLocalLogin(username: string): Promise<LocalLogin> {
    const localLogins = await BlStorage.LocalLogins.aggregate([
      { $match: { username: username } },
    ]);

    // @ts-expect-error fixme: auto ignored
    return localLogins[0];
  }

  private validateEmail(email: string) {
    if (isNullish(email) || !validator.isEmail(email)) {
      throw new BlError("email is not valid").code(701);
    }
  }
}
