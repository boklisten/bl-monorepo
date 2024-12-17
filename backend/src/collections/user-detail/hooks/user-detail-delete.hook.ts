import { CustomerHaveActiveCustomerItems } from "@backend/collections/customer-item/helpers/customer-have-active-customer-items";
import { CustomerInvoiceActive } from "@backend/collections/invoice/helpers/customer-invoice-active";
import { OrderActive } from "@backend/collections/order/helpers/order-active/order-active";
import { UserCanDeleteUserDetail } from "@backend/collections/user-detail/helpers/user-can-delete-user-detail";
import { UserDeleteAllInfo } from "@backend/collections/user-detail/helpers/user-delete-all-info";
import { Hook } from "@backend/hook/hook";
import { BlError } from "@shared/bl-error/bl-error";
import { AccessToken } from "@shared/token/access-token";

export class UserDetailDeleteHook extends Hook {
  constructor(
    private orderActive?: OrderActive,
    private customerHaveActiveCustomerItems?: CustomerHaveActiveCustomerItems,
    private customerInvoiceActive?: CustomerInvoiceActive,
    private userCanDeleteUserDetail?: UserCanDeleteUserDetail,
    private userDeleteAllInfo?: UserDeleteAllInfo,
  ) {
    super();
    this.orderActive = this.orderActive ? this.orderActive : new OrderActive();
    this.customerHaveActiveCustomerItems = this.customerHaveActiveCustomerItems
      ? this.customerHaveActiveCustomerItems
      : new CustomerHaveActiveCustomerItems();
    this.customerInvoiceActive = this.customerInvoiceActive
      ? this.customerInvoiceActive
      : new CustomerInvoiceActive();
    this.userCanDeleteUserDetail = this.userCanDeleteUserDetail
      ? this.userCanDeleteUserDetail
      : new UserCanDeleteUserDetail();
    this.userDeleteAllInfo = this.userDeleteAllInfo
      ? this.userDeleteAllInfo
      : new UserDeleteAllInfo();
  }

  public override async before(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    accessToken: AccessToken,
    id: string,
  ): Promise<boolean> {
    try {
      await this.checkIfUserCanDelete(id, accessToken);
      await this.checkActiveOrders(id);
      await this.checkActiveCustomerItems(id);
      await this.checkActiveInvoices(id);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.userDeleteAllInfo.deleteAllInfo(id, accessToken);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new BlError(`user "${id}" could not be deleted: ${e.message}`);
    }

    return true;
  }

  private async checkIfUserCanDelete(
    id: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const canDelete = await this.userCanDeleteUserDetail.canDelete(
      id,
      accessToken,
    );
    if (!canDelete) {
      throw new BlError(
        `user "${accessToken.details}" has no permission to delete user "${id}"`,
      );
    }

    return true;
  }

  private async checkActiveInvoices(userId: string): Promise<boolean> {
    const haveActiveInvoices =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.customerInvoiceActive.haveActiveInvoices(userId);
    if (haveActiveInvoices) {
      throw new BlError("customer have active invoices");
    }
    return false;
  }

  private async checkActiveCustomerItems(userId: string): Promise<boolean> {
    const haveActiveCustomerItems =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.customerHaveActiveCustomerItems.haveActiveCustomerItems(
        userId,
      );

    if (haveActiveCustomerItems) {
      throw new BlError("customer have active customer-items");
    }

    return false;
  }

  private async checkActiveOrders(userId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const haveActiveOrders = await this.orderActive.haveActiveOrders(userId);
    if (haveActiveOrders) {
      throw new BlError("customer have active orders");
    }
    return false;
  }
}
