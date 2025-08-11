import { HttpContext } from "@adonisjs/core/http";

import { userHasValidSignature } from "#services/legacy/collections/signature/helpers/signature.helper";
import { UserDetailHelper } from "#services/legacy/collections/user-detail/helpers/user-detail.helper";
import { PermissionService } from "#services/permission_service";
import { StorageService } from "#services/storage_service";
import {
  customerUpdateUserDetailsValidator,
  employeeUpdateUserDetailsValidator,
} from "#validators/user_detail";

export default class UserDetailsController {
  async get(ctx: HttpContext) {
    const paramDetailsId = ctx.request.param("detailsId");
    const { detailsId } = PermissionService.authenticate(ctx);
    if (detailsId !== paramDetailsId) {
      PermissionService.employeeOrFail(ctx);
    }
    let userDetail = await StorageService.UserDetails.getOrNull(paramDetailsId);
    if (!userDetail) return null;
    if (!new UserDetailHelper().isValid(userDetail)) {
      userDetail = await StorageService.UserDetails.update(detailsId, {
        "tasks.confirmDetails": true,
      });
    }
    if (await userHasValidSignature(userDetail)) {
      userDetail = await StorageService.UserDetails.update(detailsId, {
        "tasks.signAgreement": false,
      });
    }
    return userDetail;
  }
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
      "tasks.confirmDetails": false,
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
      "tasks.confirmDetails": false,
    });
  }
}
