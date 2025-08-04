import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import {
  customerUpdateUserDetailsValidator,
  employeeUpdateUserDetailsValidator,
} from "#validators/user_detail";

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
    await StorageService.UserDetails.update(detailsId, {
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

  async updateAsEmployee(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    const targetUserDetailsId = ctx.request.param("detailsId");
    const {
      emailVerified,
      email,
      phoneNumber,
      name,
      address,
      postalCode,
      postalCity,
      dob,
      branchMembership,
      guardian,
    } = await ctx.request.validateUsing(employeeUpdateUserDetailsValidator, {
      meta: {
        detailsId: targetUserDetailsId,
      },
    });
    await StorageService.UserDetails.update(targetUserDetailsId, {
      emailConfirmed: emailVerified,
      email,
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
