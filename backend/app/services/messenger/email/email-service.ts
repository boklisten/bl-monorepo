import logger from "@adonisjs/core/services/logger";
import { EmailHandler } from "@boklisten/bl-email";
import {
  ItemList,
  MessageOptions,
  postOffice,
  PostOffice,
  Recipient,
} from "@boklisten/bl-post-office";
import sgMail from "@sendgrid/mail";

import { DateService } from "#services/blc/date.service";
import { EMAIL_SETTINGS } from "#services/messenger/email/email-settings";
import { OrderEmailHandler } from "#services/messenger/email/order-email/order-email-handler";
import { MessengerService } from "#services/messenger/messenger-service";
import { BlStorage } from "#services/storage/bl-storage";
import { EmailOrder, EmailSetting, EmailUser } from "#services/types/email";
import { BlError } from "#shared/bl-error/bl-error";
import { CustomerItem } from "#shared/customer-item/customer-item";
import { Delivery } from "#shared/delivery/delivery";
import { Item } from "#shared/item/item";
import { Message } from "#shared/message/message";
import { MessageMethod } from "#shared/message/message-method/message-method";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";
import { UserDetail } from "#shared/user/user-detail/user-detail";
import env from "#start/env";

export class EmailService implements MessengerService {
  private emailHandler: EmailHandler;
  private orderEmailHandler: OrderEmailHandler;
  private postOffice: PostOffice;

  constructor(emailHandler?: EmailHandler, inputPostOffice?: PostOffice) {
    sgMail.setApiKey(env.get("SENDGRID_API_KEY"));
    this.emailHandler =
      emailHandler ??
      new EmailHandler({
        sendgrid: {
          apiKey: env.get("SENDGRID_API_KEY"),
        },
        locale: "nb",
      });

    this.orderEmailHandler = new OrderEmailHandler(this.emailHandler);
    this.postOffice = inputPostOffice ?? postOffice;
    this.postOffice.overrideLogger(logger);
    this.postOffice.setConfig({
      reminder: { mediums: { email: true, sms: true } },
      generic: { mediums: { email: true } },
      receipt: { mediums: { email: false, sms: false } },
    });
  }

  public send(message: Message, customerDetail: UserDetail): Promise<void> {
    if (message.messageType === "generic") {
      return this.sendGeneric(message, customerDetail);
    }

    throw `message type "${message.messageType}" not supported`;
  }

  public async sendGeneric(
    message: Message,
    customerDetail: UserDetail,
  ): Promise<void> {
    const recipient = await this.customerDetailToRecipient(
      message,
      customerDetail,
      [],
    );

    const messageOptions: MessageOptions = {
      type: "generic",
      subtype: "none",
      subject: message.subject ?? "",
      sequence_number: message.sequenceNumber ?? 0,
      htmlContent: message.htmlContent ?? "",
      textBlocks: message.textBlocks ?? [],
      mediums: this.getMessageOptionMediums(message),
    };

    try {
      await this.postOffice.send([recipient], messageOptions);
    } catch (error) {
      logger.error(`could not send generic mail: ${error}`);
    }
  }

  private getMessageOptionMediums(message: Message): {
    email: boolean;
    sms: boolean;
    voice: boolean;
  } {
    switch (message.messageMethod) {
      case MessageMethod.EMAIL: {
        return { email: true, sms: false, voice: false };
      }
      case MessageMethod.SMS: {
        return { email: false, sms: true, voice: false };
      }
      default: {
        return {
          email: false,
          sms: false,
          voice: false,
        };
      }
    }
  }

  public async orderPlaced(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<void> {
    await this.orderEmailHandler.sendOrderReceipt(customerDetail, order);
  }

  private async customerDetailToRecipient(
    message: Message,
    customerDetail: UserDetail,
    customerItems: CustomerItem[],
  ): Promise<Recipient> {
    return {
      message_id: message.id,
      user_id: customerDetail.id,
      email: customerDetail.email,
      name: customerDetail.name,
      phone: "+47" + customerDetail.phone,
      settings: {
        text: {
          deadline: message.info
            ? // @ts-expect-error fixme: auto ignored
              this.formatDeadline(message.info["deadline"])
            : "",
        },
      },
      itemList: await this.customerItemsToItemList(message, customerItems),
    };
  }

  private async customerItemsToItemList(
    message: Message,
    customerItems: CustomerItem[],
  ): Promise<ItemList> {
    if (message.messageSubtype === "partly-payment") {
      return {
        summary: {
          total:
            this.getCustomerItemLeftToPayTotal(customerItems).toString() +
            " NOK",
          totalTax: "0 NOK",
          taxPercentage: "0",
        },
        items: await this.customerItemsToEmailItems(message, customerItems),
      };
    } else {
      return {
        summary: {
          // @ts-expect-error fixme: auto ignored
          total: null,

          // @ts-expect-error fixme: auto ignored
          totalTax: null,

          // @ts-expect-error fixme: auto ignored
          taxPercentage: null,
        },
        items: await this.customerItemsToEmailItems(message, customerItems),
      };
    }
  }

  private async customerItemsToEmailItems(
    message: Message,
    customerItems: CustomerItem[],
  ): Promise<ItemList["items"]> {
    const items = [];

    for (const customerItem of customerItems) {
      const item = await BlStorage.Items.get(customerItem.item);
      items.push(this.customerItemToEmailItem(message, customerItem, item));
    }

    return items;
  }

  private customerItemToEmailItem(
    message: Message,
    customerItem: CustomerItem,
    item: Item,
  ): ItemList["items"][number] {
    if (message.messageSubtype === "partly-payment") {
      return {
        id: item.info.isbn.toString(),
        title: item.title,
        // @ts-expect-error fixme: auto ignored
        deadline: this.formatDeadline(message.info["deadline"]),
        leftToPay: customerItem.amountLeftToPay + " NOK",
      };
    } else {
      return {
        id: item.info.isbn.toString(),
        title: item.title,
        // @ts-expect-error fixme: auto ignored
        deadline: this.formatDeadline(message.info["deadline"]),
      };
    }
  }

  private formatDeadline(deadline?: Date): string {
    return deadline == undefined
      ? ""
      : DateService.toPrintFormat(deadline, "Europe/Oslo");
  }
  private getCustomerItemLeftToPayTotal(customerItems: CustomerItem[]): number {
    return customerItems.reduce(
      // @ts-expect-error fixme: auto ignored
      (total, next) => total + next.amountLeftToPay,
      0,
    );
  }

  public async deliveryInformation(
    customerDetail: UserDetail,
    order: Order,
    delivery: Delivery,
  ): Promise<void> {
    const emailSetting: EmailSetting = {
      toEmail: customerDetail.email,
      fromEmail: EMAIL_SETTINGS.types.deliveryInformation.fromEmail,
      subject: EMAIL_SETTINGS.types.deliveryInformation.subject,
      userId: customerDetail.id,
      textBlocks: [
        {
          text: "Dine bøker er nå på vei! De vil bli levert til deg ved hjelp av Bring.",
        },
        {
          text: "Vi anser nå disse bøkene som utlevert. Du er ansvarlig for bøkene fra du henter dem på postkontoret til innlevering er gjennomført. Om noe skulle skje med leveringen er det bare å ta kontakt. Fraktkostnader refunderes ikke for pakker som ikke blir hentet innen fristen.",
        },
      ],
    };

    const emailUser: EmailUser = {
      id: customerDetail.id,
      name: customerDetail.name,
      dob:
        customerDetail.dob !== undefined && customerDetail.dob !== null
          ? DateService.format(customerDetail.dob, "Europe/Oslo", "DD.MM.YYYY")
          : "",
      email: customerDetail.email,
      address: customerDetail.address,
    };

    let deliveryAddress = "";

    // @ts-expect-error fixme: auto ignored
    if (delivery.info["shipmentAddress"]) {
      // @ts-expect-error fixme: auto ignored
      deliveryAddress = delivery.info["shipmentAddress"].name;

      // @ts-expect-error fixme: auto ignored
      deliveryAddress += ", " + delivery.info["shipmentAddress"].address;

      // @ts-expect-error fixme: auto ignored
      deliveryAddress += ", " + delivery.info["shipmentAddress"].postalCode;

      // @ts-expect-error fixme: auto ignored
      deliveryAddress += " " + delivery.info["shipmentAddress"].postalCity;
    }

    const emailOrder: EmailOrder = {
      id: order.id,
      showDeadline: false,
      showPrice: false,
      showStatus: true,

      // @ts-expect-error fixme: auto ignored
      currency: null,

      // @ts-expect-error fixme: auto ignored
      itemAmount: null,

      // @ts-expect-error fixme: auto ignored
      payment: null,
      showPayment: false,

      // @ts-expect-error fixme: auto ignored
      totalAmount: null,
      items: this.orderItemsToDeliveryInformationItems(order.orderItems),
      showDelivery: true,
      delivery: {
        method: "bring",

        // @ts-expect-error fixme: auto ignored
        trackingNumber: delivery.info["trackingNumber"],
        estimatedDeliveryDate: null,
        address: deliveryAddress,
        amount: null,
        currency: null,
      },
    };

    await this.emailHandler
      .sendDelivery(emailSetting, emailOrder, emailUser)
      .catch((error) => {
        throw new BlError("Unable to send delivery email").code(200).add(error);
      });
  }

  private orderItemsToDeliveryInformationItems(
    orderItems: OrderItem[],
  ): EmailOrder["items"] {
    const emailInformaitionItems: { title: string; status: string }[] = [];
    for (const orderItem of orderItems) {
      emailInformaitionItems.push({
        title: orderItem.title,
        status: "utlevering via Bring",
      });
    }
    return emailInformaitionItems;
  }

  public async emailConfirmation(
    customerDetail: UserDetail,
    confirmationCode: string,
  ): Promise<void> {
    const emailSetting: EmailSetting = {
      toEmail: customerDetail.email,
      fromEmail: EMAIL_SETTINGS.types.emailConfirmation.fromEmail,
      subject: EMAIL_SETTINGS.types.emailConfirmation.subject,
      userId: customerDetail.id,
    };

    let emailVerificationUri = env.get("CLIENT_URI");
    emailVerificationUri +=
      EMAIL_SETTINGS.types.emailConfirmation.path + confirmationCode;

    await sendMail(
      emailSetting.fromEmail,
      EMAIL_SETTINGS.types.emailConfirmation.templateId,
      [
        {
          to: emailSetting.toEmail,
          dynamicTemplateData: {
            emailVerificationUri,
          },
        },
      ],
    );
  }

  public async passwordReset(
    userId: string,
    userEmail: string,
    pendingPasswordResetId: string,
    resetToken: string,
  ): Promise<void> {
    const emailSetting: EmailSetting = {
      toEmail: userEmail,
      fromEmail: EMAIL_SETTINGS.types.passwordReset.fromEmail,
      subject: EMAIL_SETTINGS.types.passwordReset.subject,
      userId: userId,
    };

    let passwordResetUri = env.get("CLIENT_URI");
    passwordResetUri +=
      EMAIL_SETTINGS.types.passwordReset.path +
      pendingPasswordResetId +
      `?resetToken=${resetToken}`;

    await sendMail(
      emailSetting.fromEmail,
      EMAIL_SETTINGS.types.passwordReset.templateId,
      [
        {
          to: emailSetting.toEmail,
          dynamicTemplateData: {
            passwordResetUri,
          },
        },
      ],
    );
  }
}

export async function sendMail(
  from: string,
  templateId: string,
  recipients: {
    to: string;
    dynamicTemplateData?: Record<string, unknown>;
  }[],
): Promise<{ success: boolean }> {
  try {
    const [sendGridResponse] = await sgMail.send({
      from,
      templateId,
      personalizations: recipients,
    });
    if (sendGridResponse.statusCode === 202) {
      logger.info("Successfully sent emails");
      return { success: true };
    }
    logger.error(
      `Failed to send emails, error: ${sendGridResponse.toString()}`,
    );
    return { success: false };
  } catch (error) {
    logger.error(`Failed to send emails, error: ${error}`);
    return { success: false };
  }
}
