import { APP_CONFIG } from "#services/legacy/application-config";
import { UserDetailHelper } from "#services/legacy/collections/user-detail/helpers/user-detail.helper";
import { DibsEasyOrder } from "#services/legacy/dibs/dibs-easy-order";
import { DibsEasyPayment } from "#services/legacy/dibs/dibs-easy-payment/dibs-easy-payment";
import { BlError } from "#shared/bl-error";
import { Delivery } from "#shared/delivery/delivery";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";
import { UserDetail } from "#shared/user-detail";
import env from "#start/env";
import { DibsEasyItem } from "#types/dibs-easy-item";

export class DibsPaymentService {
  private userDetailHelper = new UserDetailHelper();

  public getPaymentId(dibsEasyOrder: DibsEasyOrder): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(env.get("DIBS_URI") + APP_CONFIG.path.dibs.payment, {
        method: "POST",
        body: JSON.stringify(dibsEasyOrder),
        headers: new Headers({
          Authorization: env.get("DIBS_SECRET_KEY"),
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      })
        .then((response) => response.json())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((responseData: any) => {
          if (responseData && responseData["paymentId"]) {
            return resolve(responseData["paymentId"]);
          }
          return reject(
            new BlError("did not get the paymentId back from dibs"),
          );
        })
        .catch((blError: BlError) => {
          reject(new BlError("could not get paymentID from dibs").add(blError));
        });
    });
  }

  public fetchDibsPaymentData(paymentId: string): Promise<DibsEasyPayment> {
    return (
      fetch(
        env.get("DIBS_URI") + APP_CONFIG.path.dibs.payment + "/" + paymentId,
        {
          headers: new Headers({
            Authorization: env.get("DIBS_SECRET_KEY"),
            Accept: "application/json",
          }),
        },
      )
        .then((response) => response.json())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((response: any) => {
          if (!response["payment"]) {
            throw new BlError(
              "dibs response did not include payment information",
            ).store("paymentId", paymentId);
          }

          return response["payment"];
        })
        .catch((getDibsPaymentDetailError: BlError) => {
          throw new BlError(
            `could not get payment details for paymentId "${paymentId}"`,
          ).add(getDibsPaymentDetailError);
        })
    );
  }

  public orderToDibsEasyOrder(
    userDetail: UserDetail,
    order: Order,
    delivery?: Delivery,
  ): DibsEasyOrder {
    this.validateOrder(order);

    const items: DibsEasyItem[] = order.orderItems.map((orderItem) =>
      this.orderItemToEasyItem(orderItem),
    );

    if (order.delivery && delivery && delivery.amount > 0) {
      items.push(this.deliveryToDibsEasyItem(delivery));
    }

    const dibsEasyOrder: DibsEasyOrder = new DibsEasyOrder();

    dibsEasyOrder.order.reference = order.id;
    dibsEasyOrder.order.items = items;
    dibsEasyOrder.order.amount = this.getTotalGrossAmount(items);
    dibsEasyOrder.order.currency = "NOK";

    const userDetailValid = this.userDetailHelper.isValid(userDetail);

    const clientUri = env.get("CLIENT_URI");
    dibsEasyOrder.checkout = {
      url: clientUri + APP_CONFIG.path.client.checkout,
      termsUrl: clientUri + APP_CONFIG.path.client.agreement.rent,
      ShippingCountries: [{ countryCode: "NOR" }],
      merchantHandlesConsumerData: userDetailValid, // if userDetail is not valid, the customer must reenter data
      consumer: userDetailValid
        ? this.userDetailToDibsEasyConsumer(userDetail)
        : null,
    };

    return dibsEasyOrder;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private userDetailToDibsEasyConsumer(userDetail: UserDetail): any {
    return {
      email: userDetail.email,
      shippingAddress: {
        addressLine1: userDetail.address,
        addressLine2: "",
        postalCode: userDetail.postCode,
        city: userDetail.postCity,
        country: "NOR",
      },
      phoneNumber: {
        prefix: "+47",
        number: userDetail.phone,
      },
      privatePerson: {
        firstName: this.userDetailHelper.getFirstName(userDetail.name),
        lastName: this.userDetailHelper.getLastName(userDetail.name),
      },
    };
  }

  private deliveryToDibsEasyItem(delivery: Delivery): DibsEasyItem {
    return {
      reference: delivery.id,
      name: "delivery",
      quantity: 1,
      unit: "delivery",
      unitPrice: this.toEars(delivery.amount),
      taxRate: 0,
      taxAmount: delivery.taxAmount ? this.toEars(delivery.taxAmount) : 0,
      grossTotalAmount: this.toEars(delivery.amount),
      netTotalAmount: this.toEars(delivery.amount),
    };
  }

  private validateOrder(order: Order) {
    if (!order.id || order.id.length <= 0)
      throw new BlError("order.id is not defined");
    if (!order.byCustomer)
      throw new BlError(
        "order.byCustomer is false, no need to make dibs easy order",
      );
    if (order.amount == 0) throw new BlError("order.amount is zero");
  }

  private getTotalGrossAmount(dibsEasyItems: DibsEasyItem[]): number {
    return dibsEasyItems.reduce(
      (subTotal, dbi) => subTotal + dbi.grossTotalAmount,
      0,
    );
  }

  private orderItemToEasyItem(orderItem: OrderItem): DibsEasyItem {
    return {
      reference: orderItem.item,
      name: orderItem.title,
      quantity: 1,
      unit: "book",
      unitPrice: this.toEars(orderItem.unitPrice),
      taxRate: 0,
      taxAmount: 0,
      netTotalAmount: this.toEars(orderItem.unitPrice),
      grossTotalAmount: this.toEars(orderItem.amount),
    };
  }

  private toEars(price: number): number {
    return price * 100;
  }
}
