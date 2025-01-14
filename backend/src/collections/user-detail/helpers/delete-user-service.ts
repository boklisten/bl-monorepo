import { CustomerItemModel } from "@backend/collections/customer-item/customer-item.model";
import { InvoiceModel } from "@backend/collections/invoice/invoice.model";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { LocalLoginModel } from "@backend/collections/local-login/local-login.model";
import { OrderModel } from "@backend/collections/order/order.model";
import { PaymentModel } from "@backend/collections/payment/payment.model";
import { StandMatchModel } from "@backend/collections/stand-match/stand-match.model";
import { User } from "@backend/collections/user/user";
import { UserModel } from "@backend/collections/user/user.model";
import { UserDetailModel } from "@backend/collections/user-detail/user-detail.model";
import { UserMatchModel } from "@backend/collections/user-match/user-match.model";
import { SEDbQueryBuilder } from "@backend/query/se.db-query-builder";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Invoice } from "@shared/invoice/invoice";
import { StandMatch } from "@shared/match/stand-match";
import { UserMatch } from "@shared/match/user-match";
import { Order } from "@shared/order/order";
import { Payment } from "@shared/payment/payment";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class DeleteUserService {
  private queryBuilder: SEDbQueryBuilder;
  private userStorage: BlDocumentStorage<User>;
  private userDetailStorage: BlDocumentStorage<UserDetail>;
  private localLoginStorage: BlDocumentStorage<LocalLogin>;
  private customerItemStorage: BlDocumentStorage<CustomerItem>;
  private invoiceStorage: BlDocumentStorage<Invoice>;
  private orderStorage: BlDocumentStorage<Order>;
  private paymentStorage: BlDocumentStorage<Payment>;
  private userMatchStorage: BlDocumentStorage<UserMatch>;
  private standMatchStorage: BlDocumentStorage<StandMatch>;

  constructor(
    _userStorage?: BlDocumentStorage<User>,
    _userDetailStorage?: BlDocumentStorage<UserDetail>,
    _localLoginStorage?: BlDocumentStorage<LocalLogin>,
    _customerItemStorage?: BlDocumentStorage<CustomerItem>,
    _invoiceStorage?: BlDocumentStorage<Invoice>,
    _orderStorage?: BlDocumentStorage<Order>,
    _paymentStorage?: BlDocumentStorage<Payment>,
    _userMatchStorage?: BlDocumentStorage<UserMatch>,
    _standMatchStorage?: BlDocumentStorage<StandMatch>,
  ) {
    this.userStorage = _userStorage ?? new BlDocumentStorage(UserModel);
    this.userDetailStorage =
      _userDetailStorage ?? new BlDocumentStorage(UserDetailModel);
    this.localLoginStorage =
      _localLoginStorage ?? new BlDocumentStorage(LocalLoginModel);
    this.customerItemStorage =
      _customerItemStorage ?? new BlDocumentStorage(CustomerItemModel);
    this.invoiceStorage =
      _invoiceStorage ?? new BlDocumentStorage(InvoiceModel);
    this.orderStorage = _orderStorage ?? new BlDocumentStorage(OrderModel);
    this.paymentStorage =
      _paymentStorage ?? new BlDocumentStorage(PaymentModel);
    this.userMatchStorage =
      _userMatchStorage ?? new BlDocumentStorage(UserMatchModel);
    this.standMatchStorage =
      _standMatchStorage ?? new BlDocumentStorage(StandMatchModel);

    this.queryBuilder = new SEDbQueryBuilder();
  }

  public async deleteUser(userDetailId: string): Promise<void> {
    const databaseQuery = this.queryBuilder.getDbQuery(
      { userDetail: userDetailId },
      [{ fieldName: "userDetail", type: "object-id" }],
    );
    const users = await this.userStorage.getByQuery(databaseQuery);
    for (const user of users) {
      await this.userStorage.remove(user.id);
      await this.removeLocalLogin(user.username);
    }
  }

  private async removeLocalLogin(username: string): Promise<void> {
    const localLoginDatabaseQuery = this.queryBuilder.getDbQuery(
      { username: username },
      [{ fieldName: "username", type: "string" }],
    );
    const localLogins = await this.localLoginStorage.getByQuery(
      localLoginDatabaseQuery,
    );
    for (const localLogin of localLogins) {
      await this.localLoginStorage.remove(localLogin.id);
    }
  }

  async mergeIntoOtherUser(fromUser: string, toUser: string): Promise<void> {
    const [fromUserDetails, toUserDetails] = await Promise.all([
      this.userDetailStorage.get(fromUser),
      this.userDetailStorage.get(toUser),
    ]);
    const newOrderRefs = [
      ...(fromUserDetails.orders ?? []),
      ...(toUserDetails.orders ?? []),
    ];
    const newCustomerItemRefs = [
      ...(fromUserDetails.customerItems ?? []),
      ...(toUserDetails.customerItems ?? []),
    ];
    const newSignatureRefs = [
      ...fromUserDetails.signatures,
      ...toUserDetails.signatures,
    ];

    await Promise.all([
      this.userDetailStorage.update(toUser, {
        orders: newOrderRefs,
        customerItems: newCustomerItemRefs,
        signatures: newSignatureRefs,
      }),
      this.customerItemStorage.updateMany(
        { customer: fromUser },
        { customer: toUser },
      ),
      this.invoiceStorage.updateMany(
        {
          customerInfo: {
            userDetail: fromUser,
          },
        },
        {
          customerInfo: {
            userDetail: toUser,
          },
        },
      ),
      this.orderStorage.updateMany(
        {
          placed: true,
          customer: fromUser,
        },
        { customer: toUser },
      ),
      this.paymentStorage.updateMany(
        {
          customer: fromUser,
        },
        { customer: toUser },
      ),
      this.standMatchStorage.updateMany(
        { customer: fromUser },
        { customer: toUser },
      ),
      this.userMatchStorage.updateMany(
        {
          customerA: fromUser,
        },
        { customerA: toUser },
      ),
      this.userMatchStorage.updateMany(
        {
          customerB: fromUser,
        },
        { customerB: toUser },
      ),
    ]);
  }
}
