import { CustomerHaveActiveCustomerItems } from "@backend/lib/collections/customer-item/helpers/customer-have-active-customer-items.js";
import { CustomerInvoiceActive } from "@backend/lib/collections/invoice/helpers/customer-invoice-active.js";
import { OrderActive } from "@backend/lib/collections/order/helpers/order-active/order-active.js";
import { DeleteUserService } from "@backend/lib/collections/user-detail/helpers/delete-user-service.js";
import { UserCanDeleteUserDetail } from "@backend/lib/collections/user-detail/helpers/user-can-delete-user-detail.js";
import { Hook } from "@backend/lib/hook/hook.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { z } from "zod";
import { fromError } from "zod-validation-error";
const UserDetailDeleteSpec = z.object({
    mergeInto: z.string().optional(),
});
export class UserDetailDeleteHook extends Hook {
    orderActive;
    customerHaveActiveCustomerItems;
    customerInvoiceActive;
    userCanDeleteUserDetail;
    deleteUserService;
    constructor(orderActive, customerHaveActiveCustomerItems, customerInvoiceActive, userCanDeleteUserDetail, deleteUserService) {
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
    async before(body, accessToken, id) {
        const { data, success, error } = UserDetailDeleteSpec.safeParse(body);
        if (!success) {
            throw new BlError(fromError(error).toString()).code(701);
        }
        await this.checkIfUserCanDelete(id, accessToken);
        if (data?.mergeInto) {
            await this.deleteUserService.mergeIntoOtherUser(id, data.mergeInto);
        }
        else {
            await this.checkActiveOrders(id);
            await this.checkActiveCustomerItems(id);
            await this.checkActiveInvoices(id);
        }
        await this.deleteUserService.deleteUser(id);
        return true;
    }
    async checkIfUserCanDelete(id, accessToken) {
        const canDelete = await this.userCanDeleteUserDetail.canDelete(id, accessToken);
        if (!canDelete) {
            throw new BlError(`user "${accessToken.details}" has no permission to delete user "${id}"`).code(904);
        }
        return true;
    }
    async checkActiveInvoices(userId) {
        const haveActiveInvoices = await this.customerInvoiceActive.haveActiveInvoices(userId);
        if (haveActiveInvoices) {
            throw new BlError("customer have active invoices");
        }
        return false;
    }
    async checkActiveCustomerItems(userId) {
        const haveActiveCustomerItems = await this.customerHaveActiveCustomerItems.haveActiveCustomerItems(userId);
        if (haveActiveCustomerItems) {
            throw new BlError("customer have active customer-items");
        }
        return false;
    }
    async checkActiveOrders(userId) {
        const haveActiveOrders = await this.orderActive.haveActiveOrders(userId);
        if (haveActiveOrders) {
            throw new BlError("customer have active orders");
        }
        return false;
    }
}
