import { APP_CONFIG } from "@backend/application-config";
import { UserDetailHelper } from "@backend/collections/user-detail/helpers/user-detail.helper";
import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { HttpHandler } from "@backend/http/http.handler";
import { DibsEasyItem } from "@backend/payment/dibs/dibs-easy-item/dibs-easy-item";
import { DibsEasyOrder } from "@backend/payment/dibs/dibs-easy-order/dibs-easy-order";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class DibsPaymentService {
  private _userDetailHelper: UserDetailHelper;
  private _httpHandler: HttpHandler;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    deliveryStorage?: BlDocumentStorage<Delivery>,
    httpHandler?: HttpHandler,
  ) {
    this._httpHandler = httpHandler ?? new HttpHandler();
    this._userDetailHelper = new UserDetailHelper();
  }

  public getPaymentId(dibsEasyOrder: DibsEasyOrder): Promise<string> {
    return new Promise((resolve, reject) => {
      this._httpHandler
        .post(
          assertEnv(BlEnvironment.DIBS_URI) + APP_CONFIG.path.dibs.payment,
          dibsEasyOrder,
          assertEnv(BlEnvironment.DIBS_SECRET_KEY),
        )
        .then((responseData) => {
          if (
            responseData && // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            responseData["paymentId"]
          ) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
    return this._httpHandler
      .get(
        assertEnv(BlEnvironment.DIBS_URI) +
          APP_CONFIG.path.dibs.payment +
          "/" +
          paymentId,
        assertEnv(BlEnvironment.DIBS_SECRET_KEY),
      )
      .then((response) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!response["payment"]) {
          throw new BlError(
            "dibs response did not include payment information",
          ).store("paymentId", paymentId);
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
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

    const userDetailValid = this._userDetailHelper.isValid(userDetail);

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
        firstName: this._userDetailHelper.getFirstName(userDetail.name),
        lastName: this._userDetailHelper.getLastName(userDetail.name),
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
    const dibsEasyItem = new DibsEasyItem();

    dibsEasyItem.reference = orderItem.item;
    dibsEasyItem.name = orderItem.title;
    dibsEasyItem.quantity = 1;
    dibsEasyItem.unit = "book";
    dibsEasyItem.unitPrice = this.toEars(orderItem.unitPrice);
    dibsEasyItem.taxRate = this.toEars(orderItem.taxRate * 100);
    dibsEasyItem.taxAmount = this.toEars(orderItem.taxAmount);
    dibsEasyItem.netTotalAmount = this.toEars(orderItem.unitPrice);
    dibsEasyItem.grossTotalAmount = this.toEars(orderItem.amount);

    return dibsEasyItem;
  }

  private toEars(price: number): number {
    return price * 100;
  }
}
