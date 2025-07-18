import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { UserDetail } from "#shared/user/user-detail/user-detail";

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
};
