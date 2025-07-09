import moment from "moment-timezone";

import { DateService } from "#services/blc/date.service";
import { userHasValidSignature } from "#services/collections/signature/helpers/signature.helper";
import { sendMail } from "#services/messenger/email/email-service";
import {
  EMAIL_SENDER,
  EMAIL_SETTINGS,
} from "#services/messenger/email/email-settings";
import { sendSMS } from "#services/messenger/sms/sms-service";
import { DibsEasyPayment } from "#services/payment/dibs/dibs-easy-payment/dibs-easy-payment";
import { BlStorage } from "#services/storage/bl-storage";
import { EmailOrder, EmailSetting, EmailUser } from "#services/types/email";
import { BlError } from "#shared/bl-error/bl-error";
import { Branch } from "#shared/branch/branch";
import { Delivery } from "#shared/delivery/delivery";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";
import { OrderItemType } from "#shared/order/order-item/order-item-type";
import { Payment } from "#shared/payment/payment";
import { UserDetail } from "#shared/user/user-detail/user-detail";
import env from "#start/env";

export class OrderEmailHandler {
  private defaultCurrency = "NOK";
  private standardTimeFormat = "DD.MM.YYYY HH.mm.ss";
  private localeSetting = "nb";
  private noPaymentNoticeText =
    "Dette er kun en reservasjon, du har ikke betalt enda. Du betaler først når du kommer til oss på stand.";

  public async sendOrderReceipt(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<void> {
    const emailSetting: EmailSetting = {
      toEmail: customerDetail.email,
      fromEmail: EMAIL_SENDER.NO_REPLY,
      subject: EMAIL_SETTINGS.receipt.subject + ` #${order.id}`,
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
        ? DateService.toPrintFormat(customerDetail.dob, "Europe/Oslo")
        : "",
      name: customerDetail.name,
      email: customerDetail.email,
      address: customerDetail.address,
    };

    if (withAgreement) {
      const branch = await BlStorage.Branches.get(branchId);
      await this.requestGuardianSignature(customerDetail, branch?.name ?? "");
    }

    // fixme: this is not visible since the sendout does not currently show textblocks
    if (this.paymentNeeded(order)) {
      this.addNoPaymentProvidedNotice(emailSetting);
    }

    // fixme: add a custom subject with the order id
    await sendMail({
      from: EMAIL_SENDER.NO_REPLY,
      templateId: EMAIL_SETTINGS.receipt.templateId,
      recipients: [
        {
          to: customerDetail.email,
          dynamicTemplateData: {
            emailTemplateInput: {
              user: emailUser,
              order: emailOrder,
              userFullName: emailUser.name,
              textBlocks: emailSetting.textBlocks,
            },
          },
        },
      ],
    });
    /*
    return await this.emailHandler
      .sendOrderReceipt(emailSetting, emailOrder, emailUser, withAgreement)
      .catch((error) => {
        throw new BlError("Unable to send order receipt email")
          .code(200)
          .add(error);
      });
     */
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
  ) {
    if (
      moment(customerDetail.dob).isValid() &&
      moment(customerDetail.dob).isAfter(
        moment(new Date()).subtract(18, "years"),
      ) &&
      customerDetail?.guardian?.email
    ) {
      if (await userHasValidSignature(customerDetail)) {
        return;
      }
      await sendMail({
        from: EMAIL_SENDER.NO_REPLY,
        templateId: EMAIL_SETTINGS.guardianSignature.templateId,
        recipients: [
          {
            to: customerDetail.guardian.email,
            dynamicTemplateData: {
              guardianSignatureUri: `${env.get("CLIENT_URI")}${EMAIL_SETTINGS.guardianSignature.path}${customerDetail.id}`,
              customerName: customerDetail.name,
              guardianName: customerDetail.guardian.name,
              branchName: branchName,
            },
          },
        ],
      });
      await sendSMS(
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
      // @ts-expect-error fixme: auto ignored
      delivery: null,
      showPayment: false,
      // @ts-expect-error fixme: auto ignored
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
      BlStorage.Payments.get(payment),
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
          // @ts-expect-error fixme: auto ignored
          emailPayment.payments[0]["info"] &&
          // @ts-expect-error fixme: auto ignored
          emailPayment.payments[0]["info"]["orderDetails"]
        ) {
          emailPayment.currency =
            // @ts-expect-error fixme: auto ignored
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

    return BlStorage.Deliveries.get(deliveryId)
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

      // @ts-expect-error fixme: auto ignored
      taxAmount: isNaN(payment.taxAmount)
        ? null
        : payment.taxAmount?.toString(),
      paymentId: "",
      status: this.translatePaymentConfirmed(),
      creationTime: payment.creationTime
        ? DateService.format(
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
            // @ts-expect-error fixme: auto ignored
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

      // @ts-expect-error fixme: auto ignored
      address: delivery.info["shipmentAddress"]
        ? // @ts-expect-error fixme: auto ignored
          `${delivery.info["shipmentAddress"].name}, ${delivery.info["shipmentAddress"].address}, ${delivery.info["shipmentAddress"].postalCode} ${delivery.info["shipmentAddress"].postalCity}`
        : null,

      // @ts-expect-error fixme: auto ignored
      trackingNumber: delivery.info["trackingNumber"],

      // @ts-expect-error fixme: auto ignored
      estimatedDeliveryDate: delivery.info["estimatedDelivery"]
        ? DateService.toPrintFormat(
            // @ts-expect-error fixme: auto ignored
            delivery.info["estimatedDelivery"],
            "Europe/Oslo",
          )
        : "",
    };
  }

  private orderItemsToEmailItems(
    orderItems: OrderItem[],
  ): { title: string; status: string; deadline?: string; price?: string }[] {
    // @ts-expect-error fixme: auto ignored
    return orderItems.map((orderItem) => ({
      title: orderItem.title,
      status: this.translateOrderItemType(orderItem.type, orderItem.handout),
      deadline:
        orderItem.type === "rent" || orderItem.type === "extend"
          ? // @ts-expect-error fixme: auto ignored
            DateService.toPrintFormat(orderItem.info.to, "Europe/Oslo")
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

      // @ts-expect-error fixme: auto ignored
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
    // @ts-expect-error fixme: auto ignored
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
    return BlStorage.Branches.get(branchId)
      .then((branch: Branch) => {
        // @ts-expect-error fixme: auto ignored
        return branch.paymentInfo.responsible;
      })
      .catch((getBranchError: BlError) => {
        throw new BlError("could not get branch").add(getBranchError);
      });
  }
}
