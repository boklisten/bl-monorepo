import { Infer } from "@vinejs/vine/types";

import Blid from "#services/auth/blid";
import BlCrypto from "#services/config/bl-crypto";
import Messenger from "#services/messenger/messenger";
import { PasswordService } from "#services/password_service";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { Login, User } from "#services/types/user";
import { UserDetail } from "#shared/user/user-detail/user-detail";
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
    email,
    phoneNumber,
    password,
    name,
    address,
    postalCode,
    postalCity,
    dob,
    branchMembership,
    guardian,
  }: Infer<typeof registerSchema>) {
    const blid = await Blid.createUserBlid("local", BlCrypto.random());
    const addedUserDetail = await BlStorage.UserDetails.add(
      {
        email,
        phone: phoneNumber,
        name,
        address,
        postCode: postalCode,
        postCity: postalCity,
        dob,
        branchMembership,
        guardian: {
          name: guardian?.name ?? "",
          email: guardian?.email ?? "",
          phone: guardian?.phone ?? "",
        },
        blid,
        signatures: [],
      },
      { id: blid, permission: "customer" },
    );

    return createUser({
      username: email,
      login: {
        local: { hashedPassword: await PasswordService.hash(password) },
      },
      emailConfirmed: false,
      blid,
      userDetailId: addedUserDetail.id,
    });
  },
  async createSocialUser({
    provider,
    providerId,
    email,
    emailConfirmed,
  }: {
    provider: "facebook" | "google";
    providerId: string;
    email: string;
    emailConfirmed: boolean;
  }) {
    const blid = await Blid.createUserBlid(provider, providerId);
    const addedUserDetail = await BlStorage.UserDetails.add(
      {
        email,
        blid,
        emailConfirmed,
        // fixme: it is janky to just add this without all the details
      } as UserDetail,
      { id: blid, permission: "customer" },
    );

    return createUser({
      username: email,
      login: { [provider]: { userId: providerId } },
      emailConfirmed,
      blid,
      userDetailId: addedUserDetail.id,
    });
  },
};
