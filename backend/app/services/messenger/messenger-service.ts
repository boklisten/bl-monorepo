import { Order } from "#shared/order/order";
import { UserDetail } from "#shared/user/user-detail/user-detail";

export interface MessengerService {
  orderPlaced(customerDetail: UserDetail, order: Order): void;
  emailConfirmation(customerDetail: UserDetail, code: string): void;
  passwordReset(
    userId: string,
    userEmail: string,
    pendingPasswordResetId: string,
    resetToken: string,
  ): void;
}
