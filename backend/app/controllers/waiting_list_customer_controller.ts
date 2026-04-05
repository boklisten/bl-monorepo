import { HttpContext } from "@adonisjs/core/http";

import { PermissionService } from "#services/permission_service";
import { waitingListCustomerValidator } from "#validators/waiting_list_customer";
import WaitingListCustomer from "#models/waiting_list_customer";

export default class WaitingListCustomerController {
  async getAll(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    return (await WaitingListCustomer.all()).map(({ id, name, phoneNumber, itemId, branchId }) => ({
      id: id.toString(),
      name,
      phoneNumber,
      itemId,
      branchId,
    }));
  }

  async create(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    const { name, phoneNumber, itemId, branchId } = await ctx.request.validateUsing(
      waitingListCustomerValidator,
    );
    await WaitingListCustomer.create({ name, phoneNumber, itemId, branchId });
  }

  async destroy(ctx: HttpContext) {
    PermissionService.employeeOrFail(ctx);
    const waitingListCustomer = await WaitingListCustomer.findOrFail(ctx.request.param("id"));
    await waitingListCustomer.delete();
  }
}
