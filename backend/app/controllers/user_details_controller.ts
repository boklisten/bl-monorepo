import { HttpContext } from "@adonisjs/core/http";

import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { checkPhoneNumberValidator } from "#validators/check_phone_number";

export default class UserDetailsController {
  async checkPhoneNumberAlreadyRegistered(ctx: HttpContext) {
    const { phone } = await ctx.request.validateUsing(
      checkPhoneNumberValidator,
    );

    const databaseQuery = new SEDbQuery();
    databaseQuery.stringFilters = [{ fieldName: "phone", value: phone }];
    try {
      const existingUsers =
        await BlStorage.UserDetails.getByQuery(databaseQuery);
      return existingUsers.length > 0;
    } catch {
      // Not found
      return false;
    }
  }
}
