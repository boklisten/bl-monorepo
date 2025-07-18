import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/auth/permission.service";
import { BlStorage } from "#services/storage/bl-storage";
import { customerUpdateUserDetailsValidator } from "#validators/user_detail";

export default class UserDetailsController {
  async updateAsCustomer(ctx: HttpContext) {
    const { detailsId } = PermissionService.authenticate(ctx);
    const {
      phoneNumber,
      name,
      address,
      postalCode,
      postalCity,
      dob,
      branchMembership,
      guardian,
    } = await ctx.request.validateUsing(customerUpdateUserDetailsValidator, {
      meta: {
        detailsId,
      },
    });
    await BlStorage.UserDetails.update(detailsId, {
      phone: phoneNumber,
      name,
      address,
      postCode: postalCode,
      postCity: postalCity,
      dob,
      branchMembership,
      guardian,
    });
  }
}
