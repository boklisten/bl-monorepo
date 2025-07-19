import { Infer } from "@vinejs/vine/types";

import Messenger from "#services/messenger/messenger";
import { PasswordService } from "#services/password_service";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { Login, SocialProvider, User } from "#services/types/user";
import { UserDetailService } from "#services/user_detail_service";
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
  async getByUsername(username: string): Promise<User | null> {
    try {
      const databaseQuery = new SEDbQuery();
      databaseQuery.stringFilters = [
        { fieldName: "username", value: username },
      ];
      const [user] = await BlStorage.Users.getByQuery(databaseQuery);
      return user ?? null;
    } catch {
      return null;
    }
  },
  async connectProviderToUser(
    user: User,
    provider: SocialProvider,
    providerId: string,
  ) {
    if (user.login[provider]?.userId !== providerId) {
      await BlStorage.Users.update(user.id, {
        login: {
          ...user.login,
          [provider]: { userId: providerId },
        },
      });
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
  async createSocialUser(socialUser: {
    provider: SocialProvider;
    providerId: string;
    email: string;
    emailConfirmed: boolean;
  }) {
    const addedUserDetail =
      await UserDetailService.createSocialUserDetail(socialUser);

    return createUser({
      username: socialUser.email,
      login: { [socialUser.provider]: { userId: socialUser.providerId } },
      emailConfirmed: socialUser.emailConfirmed,
      blid: addedUserDetail.blid,
      userDetailId: addedUserDetail.id,
    });
  },
};
