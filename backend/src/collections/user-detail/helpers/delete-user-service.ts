import { BlCollectionName } from "@backend/collections/bl-collection";
import { customerItemSchema } from "@backend/collections/customer-item/customer-item.schema";
import { invoiceSchema } from "@backend/collections/invoice/invoice.schema";
import { LocalLogin } from "@backend/collections/local-login/local-login";
import { localLoginSchema } from "@backend/collections/local-login/local-login.schema";
import { orderSchema } from "@backend/collections/order/order.schema";
import { paymentSchema } from "@backend/collections/payment/payment.schema";
import { standMatchSchema } from "@backend/collections/stand-match/stand-match.schema";
import { User } from "@backend/collections/user/user";
import { UserSchema } from "@backend/collections/user/user.schema";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { userMatchSchema } from "@backend/collections/user-match/user-match.schema";
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
    this.userStorage =
      _userStorage ?? new BlDocumentStorage(BlCollectionName.Users, UserSchema);
    this.userDetailStorage =
      _userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this.localLoginStorage =
      _localLoginStorage ??
      new BlDocumentStorage(BlCollectionName.LocalLogins, localLoginSchema);
    this.customerItemStorage =
      _customerItemStorage ??
      new BlDocumentStorage(BlCollectionName.CustomerItems, customerItemSchema);
    this.invoiceStorage =
      _invoiceStorage ??
      new BlDocumentStorage(BlCollectionName.Invoices, invoiceSchema);
    this.orderStorage =
      _orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this.paymentStorage =
      _paymentStorage ??
      new BlDocumentStorage(BlCollectionName.Payments, paymentSchema);
    this.userMatchStorage =
      _userMatchStorage ??
      new BlDocumentStorage(BlCollectionName.UserMatches, userMatchSchema);
    this.standMatchStorage =
      _standMatchStorage ??
      new BlDocumentStorage(BlCollectionName.StandMatches, standMatchSchema);

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
