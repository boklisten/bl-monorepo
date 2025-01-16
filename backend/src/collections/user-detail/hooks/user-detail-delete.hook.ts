import { CustomerHaveActiveCustomerItems } from "@backend/collections/customer-item/helpers/customer-have-active-customer-items";
import { CustomerInvoiceActive } from "@backend/collections/invoice/helpers/customer-invoice-active";
import { OrderActive } from "@backend/collections/order/helpers/order-active/order-active";
import { DeleteUserService } from "@backend/collections/user-detail/helpers/delete-user-service";
import { UserCanDeleteUserDetail } from "@backend/collections/user-detail/helpers/user-can-delete-user-detail";
import { Hook } from "@backend/hook/hook";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";
import { z } from "zod";
import { fromError } from "zod-validation-error";

const UserDetailDeleteSpec = z.object({
  mergeInto: z.string().optional(),
});

export class UserDetailDeleteHook extends Hook {
  private orderActive: OrderActive;
  private customerHaveActiveCustomerItems: CustomerHaveActiveCustomerItems;
  private customerInvoiceActive: CustomerInvoiceActive;
  private userCanDeleteUserDetail: UserCanDeleteUserDetail;
  private deleteUserService: DeleteUserService;

  constructor(
    orderActive?: OrderActive,
    customerHaveActiveCustomerItems?: CustomerHaveActiveCustomerItems,
    customerInvoiceActive?: CustomerInvoiceActive,
    userCanDeleteUserDetail?: UserCanDeleteUserDetail,
    deleteUserService?: DeleteUserService,
  ) {
    super();
    this.orderActive = orderActive ?? new OrderActive();
    this.customerHaveActiveCustomerItems =
      customerHaveActiveCustomerItems ?? new CustomerHaveActiveCustomerItems();
    this.customerInvoiceActive =
      customerInvoiceActive ?? new CustomerInvoiceActive();
    this.userCanDeleteUserDetail =
      userCanDeleteUserDetail ?? new UserCanDeleteUserDetail();
    this.deleteUserService = deleteUserService ?? new DeleteUserService();
  }

  public override async before(
    body: z.infer<typeof UserDetailDeleteSpec>,
    accessToken: AccessToken,
    id: string,
  ): Promise<boolean> {
    const { data, success, error } = UserDetailDeleteSpec.safeParse(body);
    if (!success) {
      throw new BlError(fromError(error).toString()).code(701);
    }
    await this.checkIfUserCanDelete(id, accessToken);

    if (data?.mergeInto) {
      await this.deleteUserService.mergeIntoOtherUser(id, data.mergeInto);
    } else {
      await this.checkActiveOrders(id);
      await this.checkActiveCustomerItems(id);
      await this.checkActiveInvoices(id);
    }
    await this.deleteUserService.deleteUser(
      id,
      (data?.mergeInto?.length ?? 0) > 0,
    );

    return true;
  }

  private async checkIfUserCanDelete(
    id: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const canDelete = await this.userCanDeleteUserDetail.canDelete(
      id,
      accessToken,
    );
    if (!canDelete) {
      throw new BlError(
        `user "${accessToken.details}" has no permission to delete user "${id}"`,
      ).code(904);
    }

    return true;
  }

  private async checkActiveInvoices(userId: string): Promise<boolean> {
    const haveActiveInvoices =
      await this.customerInvoiceActive.haveActiveInvoices(userId);
    if (haveActiveInvoices) {
      throw new BlError("customer have active invoices");
    }
    return false;
  }

  private async checkActiveCustomerItems(userId: string): Promise<boolean> {
    const haveActiveCustomerItems =
      await this.customerHaveActiveCustomerItems.haveActiveCustomerItems(
        userId,
      );

    if (haveActiveCustomerItems) {
      throw new BlError("customer have active customer-items");
    }

    return false;
  }

  private async checkActiveOrders(userId: string): Promise<boolean> {
    const haveActiveOrders = await this.orderActive.haveActiveOrders(userId);
    if (haveActiveOrders) {
      throw new BlError("customer have active orders");
    }
    return false;
  }
}
