import { CustomerItem } from "@shared/customer-item/customer-item";
import { Message } from "@shared/message/message";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export interface CustomerDetailWithCustomerItem {
  customerDetail: UserDetail;
  customerItems: CustomerItem[];
}

export interface MessengerService {
  send(messages: Message, customerDetail: UserDetail): void;

  remind(
    message: Message,
    customerDetail: UserDetail,
    customerItems: CustomerItem[],
  ): void;

  orderPlaced(customerDetail: UserDetail, order: Order): void;

  emailConfirmation(customerDetail: UserDetail, code: string): void;
  passwordReset(
    userId: string,
    userEmail: string,
    pendingPasswordResetId: string,
    resetToken: string,
  ): void;
}
