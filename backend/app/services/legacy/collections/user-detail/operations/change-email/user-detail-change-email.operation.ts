import validator from "validator";

import { isNullish } from "#services/helper/typescript-helpers";
import { PermissionService } from "#services/permission_service";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { UserService } from "#services/user_service";
import { BlError } from "#shared/bl-error";
import { BlapiResponse } from "#shared/blapi-response";

export class UserDetailChangeEmailOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    // @ts-expect-error fixme: auto ignored
    const emailChange = blApiRequest.data["email"];

    if (isNullish(emailChange) || !validator.isEmail(emailChange))
      throw new BlError("email is not valid").code(701);

    const userDetail = await BlStorage.UserDetails.get(blApiRequest.documentId);

    const user = await UserService.getByUsername(userDetail.email);
    if (!user) throw new BlError("no user found").code(701);

    if (
      !PermissionService.isPermissionOver(
        blApiRequest.user?.permission,
        user.permission,
      )
    )
      throw new BlError("no access to change email");

    if (await UserService.getByUsername(emailChange))
      throw new BlError("email is already present in database").code(701);

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
}
