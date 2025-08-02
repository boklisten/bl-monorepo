import { Infer } from "@vinejs/vine/types";

import Messenger from "#services/messenger/messenger";
import { PasswordService } from "#services/password_service";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { Login, User } from "#services/types/user";
import { UserDetailService } from "#services/user_detail_service";
import { UserDetail } from "#shared/user-detail";
import { registerSchema } from "#validators/auth_validators";

async function createUser({
  username,
  login,
  blid,
  userDetailId,
  emailConfirmed,
}: {
  username: string;
  login: Login;
  blid: string;
  userDetailId: string;
  emailConfirmed: boolean;
}) {
  if (!emailConfirmed) {
    const emailValidation = await BlStorage.EmailValidations.add({
      userDetailId,
    });
    await Messenger.emailConfirmation(username, emailValidation.id);
  }

  return await BlStorage.Users.add({
    userDetail: userDetailId,
    permission: "customer",
    blid,
    username,
    login,
  });
}

export const UserService = {
  async getByUsername(username: string | undefined): Promise<User | null> {
    try {
      const databaseQuery = new SEDbQuery();
      databaseQuery.stringFilters = [
        { fieldName: "username", value: username ?? "" },
      ];
      const [user] = await BlStorage.Users.getByQuery(databaseQuery);
      return user ?? null;
    } catch {
      return null;
    }
  },
  async getByUserDetailsId(
    detailsId: string | undefined,
  ): Promise<User | null> {
    try {
      const databaseQuery = new SEDbQuery();
      databaseQuery.stringFilters = [
        { fieldName: "userDetail", value: detailsId ?? "" },
      ];
      const [user] = await BlStorage.Users.getByQuery(databaseQuery);
      return user ?? null;
    } catch {
      return null;
    }
  },
  async createLocalUser(localUser: Infer<typeof registerSchema>) {
    const addedUserDetail =
      await UserDetailService.createLocalUserDetail(localUser);

    return createUser({
      username: localUser.email,
      login: {
        local: {
          hashedPassword: await PasswordService.hash(localUser.password),
        },
      },
      emailConfirmed: false,
      blid: addedUserDetail.blid,
      userDetailId: addedUserDetail.id,
    });
  },
  async createVippsUser(userDetail: UserDetail, vippsUserId: string) {
    return createUser({
      username: userDetail.email,
      login: { vipps: { userId: vippsUserId, lastLogin: new Date() } },
      emailConfirmed: userDetail.emailConfirmed ?? false,
      blid: userDetail.blid,
      userDetailId: userDetail.id,
    });
  },
};
