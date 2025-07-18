import validator from "validator";

import { PermissionService } from "#services/auth/permission.service";
import UserHandler from "#services/auth/user/user.handler";
import { isNotNullish, isNullish } from "#services/helper/typescript-helpers";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

export class UserDetailChangeEmailOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    // @ts-expect-error fixme: auto ignored
    const emailChange = blApiRequest.data["email"];

    this.validateEmail(emailChange);

    const userDetail = await BlStorage.UserDetails.get(blApiRequest.documentId);

    const user = await this.getUser(userDetail.email, userDetail.blid);

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

    return new BlapiResponse([{ success: true }]);
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

  private validateEmail(email: string) {
    if (isNullish(email) || !validator.isEmail(email)) {
      throw new BlError("email is not valid").code(701);
    }
  }
}
