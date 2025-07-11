import vine from "@vinejs/vine";

import { CustomerHaveActiveCustomerItems } from "#services/collections/customer-item/helpers/customer-have-active-customer-items";
import { CustomerInvoiceActive } from "#services/collections/invoice/helpers/customer-invoice-active";
import { OrderActive } from "#services/collections/order/helpers/order-active/order-active";
import { DeleteUserService } from "#services/collections/user-detail/helpers/delete-user-service";
import { UserCanDeleteUserDetail } from "#services/collections/user-detail/helpers/user-can-delete-user-detail";
import { Hook } from "#services/hook/hook";
import { BlError } from "#shared/bl-error/bl-error";
import { AccessToken } from "#shared/token/access-token";

const userDetailDeleteValidator = vine.object({
  mergeInto: vine.string().optional(),
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
    body: unknown,
    accessToken: AccessToken,
    id: string,
  ): Promise<boolean> {
    const { mergeInto } = await vine.validate({
      schema: userDetailDeleteValidator,
      data: body,
    });
    await this.checkIfUserCanDelete(id, accessToken);

    if (mergeInto) {
      await this.deleteUserService.mergeIntoOtherUser(id, mergeInto);
    } else {
      await this.checkActiveOrders(id);
      await this.checkActiveCustomerItems(id);
      await this.checkActiveInvoices(id);
    }
    await this.deleteUserService.deleteUser(id);

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
