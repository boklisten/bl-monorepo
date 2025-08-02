import { Infer } from "@vinejs/vine/types";

import BlidService from "#services/blid_service";
import CryptoService from "#services/crypto_service";
import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { VippsUser } from "#services/types/user";
import { UserDetail } from "#shared/user-detail";
import { registerSchema } from "#validators/auth_validators";

export const UserDetailService = {
  async getByPhoneNumber(phone: string): Promise<UserDetail | null> {
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "phone", value: phone }];
    const userDetails =
      await BlStorage.UserDetails.getByQueryOrNull(databaseQuery);

    return userDetails?.[0] ?? null;
  },
  async getByEmail(email: string): Promise<UserDetail | null> {
    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "email", value: email }];
    const userDetails =
      await BlStorage.UserDetails.getByQueryOrNull(databaseQuery);

    return userDetails?.[0] ?? null;
  },
  async createVippsUserDetail(vippsUser: VippsUser, blid: string) {
    return await BlStorage.UserDetails.add(
      {
        email: vippsUser.email,
        blid,
        emailConfirmed: vippsUser.emailVerified,
        phone: vippsUser.phoneNumber,
        name: vippsUser.name,
        address: vippsUser.address,
        postCode: vippsUser.postalCode,
        postCity: vippsUser.postalCity,
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
    const blid = BlidService.createUserBlid("local", CryptoService.random());
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
