import { Order, UserDetail, Message, CustomerItem } from "@boklisten/bl-model";

export interface CustomerDetailWithCustomerItem {
  customerDetail: UserDetail;
  customerItems: CustomerItem[];
}

export interface MessengerService {
  send(messages: Message, customerDetail: UserDetail): void;
  sendMany(messages: Message[], customerDetails: UserDetail[]): void;

  remind(
    message: Message,
    customerDetail: UserDetail,
    customerItems: CustomerItem[],
  ): void;
  remindMany(
    customerDetailsWithCustomerItems: CustomerDetailWithCustomerItem[],
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
