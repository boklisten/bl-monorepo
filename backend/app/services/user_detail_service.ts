import { Infer } from "@vinejs/vine/types";

import Blid from "#services/auth/blid";
import BlCrypto from "#services/config/bl-crypto";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { SocialProvider } from "#services/types/user";
import { UserDetail } from "#shared/user/user-detail/user-detail";
import { registerSchema } from "#validators/auth_validators";

export const UserDetailService = {
  async getByPhoneNumber(phone: string): Promise<UserDetail | null> {
    try {
      const databaseQuery = new SEDbQuery();
      databaseQuery.stringFilters = [{ fieldName: "phone", value: phone }];
      const [userDetail] =
        await BlStorage.UserDetails.getByQuery(databaseQuery);
      return userDetail ?? null;
    } catch {
      return null;
    }
  },
  async getByEmail(email: string): Promise<UserDetail | null> {
    try {
      const databaseQuery = new SEDbQuery();
      databaseQuery.stringFilters = [{ fieldName: "email", value: email }];
      const [userDetail] =
        await BlStorage.UserDetails.getByQuery(databaseQuery);
      return userDetail ?? null;
    } catch {
      return null;
    }
  },
  async createSocialUserDetail({
    provider,
    providerId,
    email,
    emailConfirmed,
  }: {
    provider: SocialProvider;
    providerId: string;
    email: string;
    emailConfirmed: boolean;
  }) {
    const blid = await Blid.createUserBlid(provider, providerId);
    return await BlStorage.UserDetails.add(
      {
        email,
        blid,
        emailConfirmed,
        // fixme: it is janky to just add this without all the details
      } as UserDetail,
      { id: blid, permission: "customer" },
    );
  },
  async createLocalUserDetail({
    email,
    phoneNumber,
    name,
    address,
    postalCode,
    postalCity,
    dob,
    branchMembership,
    guardian,
  }: Infer<typeof registerSchema>) {
    const blid = await Blid.createUserBlid("local", BlCrypto.random());
    return await BlStorage.UserDetails.add(
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
  },
};
