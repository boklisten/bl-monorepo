import { Infer } from "@vinejs/vine/types";

import DispatchService from "#services/dispatch_service";
import { SEDbQuery } from "#services/legacy/query/se.db-query";
import { PasswordService } from "#services/password_service";
import { StorageService } from "#services/storage_service";
import { UserDetailService } from "#services/user_detail_service";
import { UserDetail } from "#shared/user-detail";
import { Login, User } from "#types/user";
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
    const emailValidation = await StorageService.EmailValidations.add({
      userDetailId,
    });
    await DispatchService.sendEmailConfirmation(username, emailValidation.id);
  }

  return await StorageService.Users.add({
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
      const [user] = await StorageService.Users.getByQuery(databaseQuery);
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
      const [user] = await StorageService.Users.getByQuery(databaseQuery);
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
