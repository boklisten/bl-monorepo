import Blid from "#services/auth/blid";
import BlCrypto from "#services/config/bl-crypto";
import Messenger from "#services/messenger/messenger";
import { PasswordService } from "#services/password_service";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { Login, User } from "#services/types/user";
import { UserDetail } from "#shared/user/user-detail/user-detail";

async function createUser({
  username,
  login,
  blid,
  emailConfirmed,
}: {
  username: string;
  login: Login;
  blid: string;
  emailConfirmed: boolean;
}) {
  const addedUserDetail = await BlStorage.UserDetails.add({
    email: username,
    blid,
    emailConfirmed,
    // fixme: it is janky to just add this without all the details
  } as UserDetail);

  if (!addedUserDetail.emailConfirmed) {
    const emailValidation = await BlStorage.EmailValidations.add({
      userDetailId: addedUserDetail.id,
    });
    await Messenger.emailConfirmation(username, emailValidation.id);
  }

  return await BlStorage.Users.add({
    userDetail: addedUserDetail.id,
    permission: "customer",
    blid,
    username,
    login,
  });
}

export const UserService = {
  async getOrNull(username: string): Promise<User | null> {
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
    provider: "google" | "facebook",
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
  async createLocalUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    return createUser({
      username,
      login: {
        local: { hashedPassword: await PasswordService.hash(password) },
      },
      emailConfirmed: false,
      blid: await Blid.createUserBlid("local", BlCrypto.random()),
    });
  },
  async createSocialUser({
    username,
    provider,
    providerId,
    emailConfirmed,
  }: {
    username: string;
    provider: "facebook" | "google";
    providerId: string;
    emailConfirmed: boolean;
  }) {
    return createUser({
      username,
      login: { [provider]: { userId: providerId } },
      emailConfirmed,
      blid: await Blid.createUserBlid(provider, providerId),
    });
  },
};
