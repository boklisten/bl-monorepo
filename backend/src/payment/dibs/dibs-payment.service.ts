import { APP_CONFIG } from "@backend/application-config.js";
import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper.js";
import { assertEnv, BlEnvironment } from "@backend/config/environment.js";
import HttpHandler from "@backend/http/http.handler.js";
import { DibsEasyItem } from "@backend/payment/dibs/dibs-easy-item/dibs-easy-item.js";
import { DibsEasyOrder } from "@backend/payment/dibs/dibs-easy-order/dibs-easy-order.js";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { Delivery } from "@shared/delivery/delivery.js";
import { OrderItem } from "@shared/order/order-item/order-item.js";
import { Order } from "@shared/order/order.js";
import { UserDetail } from "@shared/user/user-detail/user-detail.js";

export class DibsPaymentService {
  private userDetailHelper = new UserDetailHelper();

  public getPaymentId(dibsEasyOrder: DibsEasyOrder): Promise<string> {
    return new Promise((resolve, reject) => {
      HttpHandler.post(
        assertEnv(BlEnvironment.DIBS_URI) + APP_CONFIG.path.dibs.payment,
        dibsEasyOrder,
        assertEnv(BlEnvironment.DIBS_SECRET_KEY),
      )
        .then((responseData) => {
          if (
            responseData &&
            // @ts-expect-error fixme: auto ignored
            responseData["paymentId"]
          ) {
            // @ts-expect-error fixme: auto ignored
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
    return HttpHandler.get(
      assertEnv(BlEnvironment.DIBS_URI) +
        APP_CONFIG.path.dibs.payment +
        "/" +
        paymentId,
      assertEnv(BlEnvironment.DIBS_SECRET_KEY),
    )
      .then((response) => {
        // @ts-expect-error fixme: auto ignored
        if (!response["payment"]) {
          throw new BlError(
            "dibs response did not include payment information",
          ).store("paymentId", paymentId);
        }

        // @ts-expect-error fixme: auto ignored
        return response["payment"];
      })
      .catch((getDibsPaymentDetailError: BlError) => {
        throw new BlError(
          `could not get payment details for paymentId "${paymentId}"`,
        ).add(getDibsPaymentDetailError);
      });
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

    const clientUri = assertEnv(BlEnvironment.CLIENT_URI);
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
      taxRate: this.toEars(orderItem.taxRate * 100),
      taxAmount: this.toEars(orderItem.taxAmount),
      netTotalAmount: this.toEars(orderItem.unitPrice),
      grossTotalAmount: this.toEars(orderItem.amount),
    };
  }

  private toEars(price: number): number {
    return price * 100;
  }
}
