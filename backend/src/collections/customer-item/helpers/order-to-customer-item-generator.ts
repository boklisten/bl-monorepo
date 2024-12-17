import { BlCollectionName } from "@backend/collections/bl-collection";
import { userDetailSchema } from "@backend/collections/user-detail/user-detail.schema";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class OrderToCustomerItemGenerator {
  private _userDetailStorage: BlDocumentStorage<UserDetail>;

  constructor(userDetailStorage?: BlDocumentStorage<UserDetail>) {
    this._userDetailStorage =
      userDetailStorage ??
      new BlDocumentStorage(BlCollectionName.UserDetails, userDetailSchema);
  }

  public async generate(order: Order): Promise<CustomerItem[]> {
    const customerItems = [];

    if (!order.customer) {
      return [];
    }

    const customerDetail = await this._userDetailStorage.get(order.customer);

    for (const orderItem of order.orderItems) {
      if (this.shouldCreateCustomerItem(orderItem)) {
        const customerItem = this.convertOrderItemToCustomerItem(
          customerDetail,
          order,
          orderItem,
        );
        customerItem.viewableFor = [customerDetail?.blid ?? ""];
        customerItems.push(customerItem);
      }
    }

    return customerItems;
  }

  private shouldCreateCustomerItem(orderItem: OrderItem) {
    return (
      orderItem.type === "partly-payment" ||
      orderItem.type === "rent" ||
      orderItem.type === "loan" ||
      orderItem.type === "match-receive"
    );
  }

  private convertOrderItemToCustomerItem(
    customerDetail: UserDetail,
    order: Order,
    orderItem: OrderItem,
  ): CustomerItem {
    if (orderItem.type === "partly-payment") {
      return this.createPartlyPaymentCustomerItem(
        customerDetail,
        order,
        orderItem,
      );
    } else if (
      orderItem.type === "rent" ||
      orderItem.type === "match-receive"
    ) {
      return this.createRentCustomerItem(customerDetail, order, orderItem);
    } else if (orderItem.type === "loan") {
      return this.createLoanCustomerItem(customerDetail, order, orderItem);
    }

    throw new Error(`orderItem type "${orderItem.type}" is not supported`);
  }

  private createPartlyPaymentCustomerItem(
    customerDetail: UserDetail,
    order: Order,
    orderItem: OrderItem,
  ): CustomerItem {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      id: null,
      type: "partly-payment",
      item: orderItem.item,
      blid: orderItem.blid,
      age: orderItem.age,
      customer: order.customer, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deadline: orderItem.info.to,
      handout: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      handoutInfo: this.createHandoutInfo(order),
      returned: false, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      amountLeftToPay: orderItem["info"]["amountLeftToPay"],
      totalAmount: orderItem.amount,
      orders: [order.id],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      customerInfo: this.createCustomerInfo(customerDetail),
    };
  }

  private createRentCustomerItem(
    customerDetail: UserDetail,
    order: Order,
    orderItem: OrderItem,
  ): CustomerItem {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      id: null,
      type: "rent",
      item: orderItem.item,
      blid: orderItem.blid,
      age: orderItem.age,
      customer: order.customer, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deadline: orderItem.info.to,
      handout: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      handoutInfo: this.createHandoutInfo(order),
      returned: false,
      totalAmount: orderItem.amount,
      orders: [order.id],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      customerInfo: this.createCustomerInfo(customerDetail),
    };
  }

  private createLoanCustomerItem(
    customerDetail: UserDetail,
    order: Order,
    orderItem: OrderItem,
  ): CustomerItem {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      id: null,
      type: "loan",
      item: orderItem.item,
      blid: orderItem.blid,
      age: orderItem.age,
      customer: order.customer, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deadline: orderItem.info.to,
      handout: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      handoutInfo: this.createHandoutInfo(order),
      returned: false,
      totalAmount: orderItem.amount,
      orders: [order.id],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      customerInfo: this.createCustomerInfo(customerDetail),
    };
  }

  private createHandoutInfo(order: Order) {
    return {
      handoutBy: "branch",
      handoutById: order.branch,
      handoutEmployee: order.employee,
      time: order.creationTime,
    };
  }

  private createCustomerInfo(customerDetail: UserDetail) {
    return {
      name: customerDetail.name,
      phone: customerDetail.phone,
      address: customerDetail.address,
      postCode: customerDetail.postCode,
      postCity: customerDetail.postCity,
      dob: customerDetail.dob,
      guardian: customerDetail.guardian,
    };
  }
}
