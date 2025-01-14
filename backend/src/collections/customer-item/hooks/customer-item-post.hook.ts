import { BlCollectionName } from "@backend/collections/bl-collection";
import { CustomerItemValidator } from "@backend/collections/customer-item/validators/customer-item-validator";
import { orderSchema } from "@backend/collections/order/order.schema";
import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { Hook } from "@backend/hook/hook";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Order } from "@shared/order/order";
import { AccessToken } from "@shared/token/access-token";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class CustomerItemPostHook extends Hook {
  private _customerItemValidator: CustomerItemValidator;
  private _userDetailStorage: BlDocumentStorage<UserDetail>;
  private _orderStorage: BlDocumentStorage<Order>;
  private _userDetailHelper: UserDetailHelper;

  constructor(
    customerItemValidator?: CustomerItemValidator,
    userDetailStorage?: BlDocumentStorage<UserDetail>,
    orderStorage?: BlDocumentStorage<Order>,
    userDetailHelper?: UserDetailHelper,
  ) {
    super();
    this._customerItemValidator =
      customerItemValidator ?? new CustomerItemValidator();
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
    this._orderStorage =
      orderStorage ??
      new BlDocumentStorage(BlCollectionName.Orders, orderSchema);
    this._userDetailHelper = userDetailHelper ?? new UserDetailHelper();
  }

  public override before(customerItem: CustomerItem): Promise<boolean> {
    if (!customerItem) {
      return Promise.reject(new BlError("customerItem is undefined"));
    }

    return this._userDetailStorage
      .get(customerItem.customer)
      .then((userDetail: UserDetail) => {
        if (!this._userDetailHelper.isValid(userDetail)) {
          throw new BlError(`userDetail "${customerItem.customer}" not valid`);
        }

        return this._customerItemValidator
          .validate(customerItem)
          .then(() => {
            return true;
          })
          .catch((customerItemValidationError: BlError) => {
            throw new BlError("could not validate customerItem").add(
              customerItemValidationError,
            );
          });
      })
      .catch((blError: BlError) => {
        throw blError;
      });
  }

  public override after(
    customerItems: CustomerItem[],
    accessToken: AccessToken,
  ): Promise<CustomerItem[]> {
    // we know that the customerItem that is sent here are valid, we can just update the userDetail

    if (!customerItems || customerItems.length <= 0) {
      return Promise.reject(new BlError("customerItems is empty or undefined"));
    }

    if (customerItems.length > 1) {
      return Promise.reject(
        new BlError("there are more than one customerItem"),
      );
    }

    // @ts-expect-error fixme: auto ignored
    const customerItem: CustomerItem = customerItems[0];

    if (!customerItem.orders) {
      return Promise.reject(new BlError("customerItem.orders is not defined"));
    }

    if (customerItem.orders.length !== 1) {
      return Promise.reject(
        new BlError(
          `customerItem.orders.length is "${customerItem.orders.length}" but should be "1"`,
        ),
      );
    }

    return this._orderStorage
      .get(customerItem.orders[0] ?? "")
      .then((order: Order) => {
        //update the corresponding orderItem with customerItem
        for (const orderItem of order.orderItems) {
          if (orderItem.item.toString() === customerItem.item.toString()) {
            orderItem.info = Object.assign(
              { customerItem: customerItem.id },
              orderItem.info,
            );
            break;
          }
        }
        return this._orderStorage.update(order.id, {
          orderItems: order.orderItems,
        });
      })
      .then(() => {
        return this._userDetailStorage.get(customerItem.customer);
      })
      .then((userDetail: UserDetail) => {
        // @ts-expect-error fixme: auto ignored
        let newCustomerItems = [];

        if (
          !userDetail.customerItems ||
          (userDetail.customerItems && userDetail.customerItems.length === 0)
        ) {
          newCustomerItems.push(customerItem.id);
        } else if (
          userDetail.customerItems &&
          userDetail.customerItems.length > 0
        ) {
          newCustomerItems = userDetail.customerItems;
          newCustomerItems.push(customerItem.id);
        }

        return this._userDetailStorage.update(
          userDetail.id,
          // @ts-expect-error fixme: auto ignored
          { customerItems: newCustomerItems },
        );
      })
      .then(() => {
        return [customerItem];
      })
      .catch((blError: BlError) => {
        throw blError
          .store("userDetail", accessToken.sub)
          .store("customerItemId", customerItem.id);
      });
  }
}
