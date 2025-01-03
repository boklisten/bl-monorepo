import { dateService } from "@backend/blc/date.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { branchSchema } from "@backend/collections/branch/branch.schema";
import { deliverySchema } from "@backend/collections/delivery/delivery.schema";
import { paymentSchema } from "@backend/collections/payment/payment.schema";
import { userHasValidSignature } from "@backend/collections/signature/helpers/signature.helper";
import {
  Signature,
  signatureSchema,
} from "@backend/collections/signature/signature.schema";
import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { sendMail } from "@backend/messenger/email/email-service";
import { EMAIL_SETTINGS } from "@backend/messenger/email/email-settings";
import { sendSMS } from "@backend/messenger/sms/sms-service";
import { DibsEasyPayment } from "@backend/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { EmailHandler, EmailLog } from "@boklisten/bl-email";
import { EmailOrder } from "@boklisten/bl-email/dist/ts/template/email-order";
import { EmailSetting } from "@boklisten/bl-email/dist/ts/template/email-setting";
import { EmailUser } from "@boklisten/bl-email/dist/ts/template/email-user";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { Delivery } from "@shared/delivery/delivery";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { OrderItemType } from "@shared/order/order-item/order-item-type";
import { Payment } from "@shared/payment/payment";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import moment from "moment-timezone";

export class OrderEmailHandler {
  private defaultCurrency = "NOK";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private standardDayFormat = "DD.MM.YY";
  private standardTimeFormat = "DD.MM.YYYY HH.mm.ss";
  private localeSetting = "nb";
  private noPaymentNoticeText =
    "Dette er kun en reservasjon, du har ikke betalt enda. Du betaler først når du kommer til oss på stand.";
  private readonly _signatureStorage: BlDocumentStorage<Signature>;

  constructor(
    private _emailHandler: EmailHandler,
    private _deliveryStorage?: BlDocumentStorage<Delivery>,
    private _paymentStorage?: BlDocumentStorage<Payment>,
    private _branchStorage?: BlDocumentStorage<Branch>,
    signatureStorage?: BlDocumentStorage<Signature>,
  ) {
    this._deliveryStorage = _deliveryStorage
      ? _deliveryStorage
      : new BlDocumentStorage(BlCollectionName.Deliveries, deliverySchema);
    this._paymentStorage = _paymentStorage
      ? _paymentStorage
      : new BlDocumentStorage(BlCollectionName.Payments, paymentSchema);
    this._branchStorage = _branchStorage
      ? _branchStorage
      : new BlDocumentStorage(BlCollectionName.Branches, branchSchema);
    this._signatureStorage =
      signatureStorage ??
      new BlDocumentStorage(BlCollectionName.Signatures, signatureSchema);
  }

  public async sendOrderReceipt(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailLog> {
    const emailSetting: EmailSetting = {
      toEmail: customerDetail.email,
      fromEmail: EMAIL_SETTINGS.types.receipt.fromEmail,
      subject: EMAIL_SETTINGS.types.receipt.subject + ` #${order.id}`,
      userId: customerDetail.id,
    };

    const branchId = order.branch;

    const withAgreement: boolean = await this.shouldSendAgreement(
      order,
      customerDetail,
      branchId,
    );

    const emailOrder: EmailOrder = await this.orderToEmailOrder(order);
    emailOrder.loan = withAgreement;

    const emailUser: EmailUser = {
      id: customerDetail.id,
      dob: customerDetail.dob
        ? dateService.toPrintFormat(customerDetail.dob, "Europe/Oslo")
        : "",
      name: customerDetail.name,
      email: customerDetail.email,
      address: customerDetail.address,
    };

    if (withAgreement) {
      const branch = await this._branchStorage?.get(branchId);
      this.requestGuardianSignature(
        customerDetail,
        branch?.name ?? "",
        emailOrder,
        emailUser,
      );
    }

    if (this.paymentNeeded(order)) {
      this.addNoPaymentProvidedNotice(emailSetting);
    }

    return await this._emailHandler
      .sendOrderReceipt(emailSetting, emailOrder, emailUser, withAgreement)
      .catch((error) => {
        throw new BlError("Unable to send order receipt email")
          .code(200)
          .add(error);
      });
  }

  private paymentNeeded(order: Order): boolean {
    return (
      order.amount > 0 &&
      (!Array.isArray(order.payments) || order.payments.length === 0)
    );
  }

  private addNoPaymentProvidedNotice(emailSetting: EmailSetting) {
    emailSetting.textBlocks ??= [];

    emailSetting.textBlocks.push({
      text: this.noPaymentNoticeText,
      warning: true,
    });
  }

  /**
   * sends out SMS and email to the guardian of a customer with a signature link if they are under 18
   */
  private async requestGuardianSignature(
    customerDetail: UserDetail,
    branchName: string,
    emailOrder: EmailOrder,
    emailUser: EmailUser,
  ) {
    if (
      moment(customerDetail.dob).isValid() &&
      moment(customerDetail.dob).isAfter(
        moment(new Date()).subtract(18, "years"),
      ) &&
      customerDetail?.guardian?.email
    ) {
      const emailSetting: EmailSetting = {
        toEmail: customerDetail.guardian.email,
        fromEmail: EMAIL_SETTINGS.types.guardianSignature.fromEmail,
        subject: EMAIL_SETTINGS.types.guardianSignature.subject,
        userId: customerDetail.id,
        userFullName: customerDetail.name,
      };

      /** TODO: delete after 1. oktober 2024 */
      const receiptEmailSetting: EmailSetting = {
        toEmail: customerDetail.guardian.email,
        fromEmail: EMAIL_SETTINGS.types.receipt.fromEmail,
        subject: EMAIL_SETTINGS.types.receipt.subject + ` #${emailOrder.id}`,
        userId: customerDetail.id,
        userFullName: customerDetail.guardian.name,
      };
      this._emailHandler.sendOrderReceipt(
        receiptEmailSetting,
        emailOrder,
        emailUser,
        true,
      );
      /** --- */

      if (await userHasValidSignature(customerDetail, this._signatureStorage)) {
        return;
      }
      sendMail(
        emailSetting,
        EMAIL_SETTINGS.types.guardianSignature.templateId,
        {
          guardianSignatureUri: `${assertEnv(BlEnvironment.CLIENT_URI)}${EMAIL_SETTINGS.types.guardianSignature.path}${customerDetail.id}`,
          customerName: customerDetail.name,
          guardianName: customerDetail.guardian.name,
          branchName: branchName,
        },
      );
      sendSMS(
        customerDetail.guardian.phone,
        `Hei. ${customerDetail.name} har nylig bestilt bøker fra ${branchName} gjennom Boklisten.no. Siden ${customerDetail.name} er under 18 år, krever vi at du som foresatt signerer låneavtalen. Vi har derfor sendt en epost til ${customerDetail.guardian.email} med lenke til signering. Ta kontakt på info@boklisten.no om du har spørsmål. Mvh. Boklisten`,
      );
    }
  }

  public async orderToEmailOrder(order: Order): Promise<EmailOrder> {
    const emailOrder: EmailOrder = {
      id: order.id,
      showDeadline: this.shouldShowDeadline(order),
      showPrice: order.amount !== 0,
      showStatus: true,
      currency: this.defaultCurrency,
      itemAmount: order.amount.toString(),
      totalAmount: order.amount.toString(), // should include the totalAmount including the delivery amount
      items: this.orderItemsToEmailItems(order.orderItems),
      showDelivery: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delivery: null,
      showPayment: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      payment: null,
    };

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let emailOrderDelivery: { showDelivery: boolean; delivery: any };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let emailOrderPayment: { showPayment: boolean; payment: any };

    try {
      emailOrderDelivery = await this.extractEmailOrderDeliveryFromOrder(order);
      emailOrderPayment = await this.extractEmailOrderPaymentFromOrder(order);
    } catch (error) {
      throw new BlError("could not create email based on order" + error);
    }

    emailOrder.showDelivery = emailOrderDelivery.showDelivery;
    emailOrder.delivery = emailOrderDelivery.delivery;

    if (emailOrder.delivery) {
      emailOrder.totalAmount =
        order.amount + emailOrderDelivery.delivery["amount"];
    }

    emailOrder.showPayment = emailOrderPayment.showPayment;
    emailOrder.payment = emailOrderPayment.payment;

    return emailOrder;
  }

  private shouldShowDeadline(order: Order) {
    return order.orderItems.some(
      (orderItem) => orderItem.type === "rent" || orderItem.type === "extend",
    );
  }

  private extractEmailOrderPaymentFromOrder(
    order: Order,
  ): Promise<{ payment: unknown; showPayment: boolean }> {
    if (!Array.isArray(order.payments) || order.payments.length === 0) {
      return Promise.resolve({ payment: null, showPayment: false });
    }

    const paymentPromises: Promise<Payment>[] = order.payments.map((payment) =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._paymentStorage.get(payment),
    );

    return Promise.all(paymentPromises)
      .then((payments: Payment[]) => {
        const emailPayment = {
          total: payments.reduce(
            (subTotal, payment) => subTotal + payment.amount,
            0,
          ),
          currency: this.defaultCurrency,
          taxAmount: 0,
          payments: payments.map((payment) =>
            this.paymentToEmailPayment(payment),
          ),
        };

        if (
          emailPayment.payments[0] &&
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          emailPayment.payments[0]["info"] &&
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          emailPayment.payments[0]["info"]["orderDetails"]
        ) {
          emailPayment.currency =
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            emailPayment.payments[0]["info"]["orderDetails"].currency;
        }

        return { payment: emailPayment, showPayment: true };
      })
      .catch((getPaymentsError) => {
        throw getPaymentsError;
      });
  }

  private extractEmailOrderDeliveryFromOrder(
    order: Order,
  ): Promise<{ delivery: unknown; showDelivery: boolean }> {
    const deliveryId = order.delivery;
    if (!deliveryId?.length) {
      return Promise.resolve({ delivery: null, showDelivery: false });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._deliveryStorage
      .get(deliveryId)
      .then((delivery: Delivery) => {
        return delivery.method === "bring"
          ? {
              delivery: this.deliveryToEmailDelivery(delivery),
              showDelivery: true,
            }
          : { delivery: null, showDelivery: false };
      })
      .catch((getDeliveryError: BlError) => {
        throw getDeliveryError;
      });
  }

  private paymentToEmailPayment(payment: Payment) {
    if (!payment) {
      return null;
    }

    const paymentObject = {
      method: "",
      amount: "",
      cardInfo: null,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      taxAmount: isNaN(payment.taxAmount)
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          null
        : payment.taxAmount?.toString(),
      paymentId: "",
      status: this.translatePaymentConfirmed(),
      creationTime: payment.creationTime
        ? dateService.format(
            payment.creationTime,
            "Europe/Oslo",
            this.standardTimeFormat,
          )
        : null,
    };

    if (payment.method === "dibs") {
      if (payment.info) {
        // fixme baaaad type conversion
        const paymentInfo: DibsEasyPayment =
          payment.info as unknown as DibsEasyPayment;
        if (paymentInfo.paymentDetails) {
          if (paymentInfo.paymentDetails.paymentMethod) {
            paymentObject.method = paymentInfo.paymentDetails.paymentMethod;
          }

          if (paymentInfo.paymentDetails.cardDetails?.maskedPan) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            paymentObject.cardInfo = `***${this.stripTo4LastDigits(
              paymentInfo.paymentDetails.cardDetails.maskedPan,
            )}`;
          }
        }

        if (paymentInfo.orderDetails?.amount) {
          paymentObject.amount = (
            Number.parseInt(paymentInfo.orderDetails.amount.toString()) / 100
          ).toString();
        }

        if (paymentInfo.paymentId) {
          paymentObject.paymentId = paymentInfo.paymentId;
        }
      }
    } else {
      if (payment.method) {
        paymentObject.method = payment.method;
      }

      if (payment.amount) {
        paymentObject.amount = payment.amount.toString();
      }

      if (payment.id) {
        paymentObject.paymentId = payment.id;
      }
    }

    return paymentObject;
  }

  private deliveryToEmailDelivery(delivery: Delivery) {
    return {
      method: delivery.method,
      currency: this.defaultCurrency,
      amount: delivery.amount,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      address: delivery.info["shipmentAddress"]
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `${delivery.info["shipmentAddress"].name}, ${delivery.info["shipmentAddress"].address}, ${delivery.info["shipmentAddress"].postalCode} ${delivery.info["shipmentAddress"].postalCity}`
        : null,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      trackingNumber: delivery.info["trackingNumber"],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      estimatedDeliveryDate: delivery.info["estimatedDelivery"]
        ? dateService.toPrintFormat(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delivery.info["estimatedDelivery"],
            "Europe/Oslo",
          )
        : "",
    };
  }

  private orderItemsToEmailItems(
    orderItems: OrderItem[],
  ): { title: string; status: string; deadline?: string; price?: string }[] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return orderItems.map((orderItem) => ({
      title: orderItem.title,
      status: this.translateOrderItemType(orderItem.type, orderItem.handout),
      deadline:
        orderItem.type === "rent" || orderItem.type === "extend"
          ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dateService.toPrintFormat(orderItem.info.to, "Europe/Oslo")
          : null,
      price:
        orderItem.type !== "return" && orderItem.amount
          ? orderItem.amount.toString()
          : null,
    }));
  }

  private stripTo4LastDigits(cardNumber: string) {
    return cardNumber && cardNumber.length > 4
      ? cardNumber.slice(-4)
      : cardNumber;
  }

  private translatePaymentConfirmed(): string {
    return this.localeSetting === "nb" ? "bekreftet" : "confirmed";
  }

  private translateOrderItemType(
    orderItemType: OrderItemType,
    handout?: boolean,
  ): string {
    if (this.localeSetting === "nb") {
      const translations = {
        rent: "lån",
        return: "returnert",
        extend: "forlenget",
        cancel: "kansellert",
        buy: "kjøp",
        "partly-payment": "delbetaling",
        buyback: "tilbakekjøp",
        buyout: "utkjøp",
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return `${translations[orderItemType] ?? orderItemType}${
        handout && orderItemType !== "return" ? " - utlevert" : ""
      }`;
    }

    return orderItemType;
  }

  private async shouldSendAgreement(
    order: Order,
    customerDetail: UserDetail,
    branchId: string,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const onlyHandout = order.orderItems[0].handout;
    const rentFound = order.orderItems.some(
      (orderItem) => orderItem.type === "rent",
    );

    if (onlyHandout) {
      return false;
    }

    if (!rentFound) {
      return false;
    }

    if (
      customerDetail.dob &&
      moment(customerDetail.dob).isValid() &&
      moment(customerDetail.dob).isAfter(
        moment(new Date()).subtract(18, "years"),
      )
    ) {
      return true; // the user is under the age of 18
    }

    return await this.isBranchResponsible(branchId);
  }

  private isBranchResponsible(branchId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._branchStorage
      .get(branchId)
      .then((branch: Branch) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return branch.paymentInfo.responsible;
      })
      .catch((getBranchError: BlError) => {
        throw new BlError("could not get branch").add(getBranchError);
      });
  }
}
