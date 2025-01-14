import { dateService } from "@backend/blc/date.service";
import { BlCollectionName } from "@backend/collections/bl-collection";
import { itemSchema } from "@backend/collections/item/item.schema";
import { assertEnv, BlEnvironment } from "@backend/config/environment";
import { logger } from "@backend/logger/logger";
import { EMAIL_SETTINGS } from "@backend/messenger/email/email-settings";
import { OrderEmailHandler } from "@backend/messenger/email/order-email/order-email-handler";
import { MessengerService } from "@backend/messenger/messenger-service";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { EmailHandler } from "@boklisten/bl-email";
import { EmailOrder } from "@boklisten/bl-email/dist/ts/template/email-order";
import { EmailSetting } from "@boklisten/bl-email/dist/ts/template/email-setting";
import { EmailUser } from "@boklisten/bl-email/dist/ts/template/email-user";
import {
  ItemList,
  MessageOptions,
  postOffice,
  PostOffice,
  Recipient,
} from "@boklisten/bl-post-office";
import sgMail from "@sendgrid/mail";
import { BlError } from "@shared/bl-error/bl-error";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Delivery } from "@shared/delivery/delivery";
import { Item } from "@shared/item/item";
import { Message } from "@shared/message/message";
import { MessageMethod } from "@shared/message/message-method/message-method";
import { Order } from "@shared/order/order";
import { OrderItem } from "@shared/order/order-item/order-item";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class EmailService implements MessengerService {
  private _emailHandler: EmailHandler;
  private _orderEmailHandler: OrderEmailHandler;
  private _itemStorage: BlDocumentStorage<Item>;
  private _postOffice: PostOffice;

  constructor(
    emailHandler?: EmailHandler,
    itemStorage?: BlDocumentStorage<Item>,
    inputPostOffice?: PostOffice,
  ) {
    sgMail.setApiKey(assertEnv(BlEnvironment.SENDGRID_API_KEY));
    this._emailHandler = emailHandler
      ? emailHandler
      : new EmailHandler({
          sendgrid: {
            apiKey: assertEnv(BlEnvironment.SENDGRID_API_KEY),
          },
          locale: "nb",
        });

    this._itemStorage = itemStorage
      ? itemStorage
      : new BlDocumentStorage<Item>(BlCollectionName.Items, itemSchema);
    this._orderEmailHandler = new OrderEmailHandler(this._emailHandler);
    this._postOffice = inputPostOffice ? inputPostOffice : postOffice;
    this._postOffice.overrideLogger(logger);
    this._postOffice.setConfig({
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
      await this._postOffice.send([recipient], messageOptions);
    } catch (error) {
      logger.error(`could not send generic mail: ${error}`);
    }
  }

  /**
   * Sends out a reminder to the email specified in customerDetail
   * The email will include the customerItems with the deadline
   * @param message message the email service should update on later actions
   * @param customerDetail the customer to send email to
   * @param customerItems a list of customerItems to include in the email
   */
  public async remind(
    message: Message,
    customerDetail: UserDetail,
    customerItems: CustomerItem[],
  ): Promise<boolean> {
    const recipient = await this.customerDetailToRecipient(
      message,
      customerDetail,
      customerItems,
    );

    const messageOptions: MessageOptions = {
      type: message.messageType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subtype: message.messageSubtype as any,
      sequence_number: message.sequenceNumber ?? 0,
      textBlocks: message.textBlocks ?? [],
      mediums: this.getMessageOptionMediums(message),
      customContent: message.customContent ?? "",
    };

    try {
      await this._postOffice.send([recipient], messageOptions);

      if (
        customerDetail.dob &&
        customerDetail.guardian &&
        !dateService.isOver18(customerDetail.dob)
      ) {
        await this.sendToGuardian(customerDetail, recipient, messageOptions);
      }
      return true;
    } catch (error) {
      logger.error(`could not send reminder: ${error}`);
      return true;
    }
  }

  private async sendToGuardian(
    customerDetail: UserDetail,
    recipient: Recipient,
    messageOptions: MessageOptions,
  ): Promise<boolean> {
    if (
      !customerDetail.guardian ||
      !customerDetail.guardian.email ||
      !customerDetail.guardian.phone
    ) {
      return false;
    }

    recipient.email = customerDetail.guardian.email;
    recipient.phone = "+47" + customerDetail.guardian.phone;

    return this._postOffice.send([recipient], messageOptions);
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
    await this._orderEmailHandler.sendOrderReceipt(customerDetail, order);
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
      const item = await this._itemStorage.get(customerItem.item);
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
      : dateService.toPrintFormat(deadline, "Europe/Oslo");
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
          ? dateService.format(customerDetail.dob, "Europe/Oslo", "DD.MM.YYYY")
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

    await this._emailHandler
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

    let emailVerificationUri = assertEnv(BlEnvironment.CLIENT_URI);
    emailVerificationUri +=
      EMAIL_SETTINGS.types.emailConfirmation.path + confirmationCode;

    await sendMail(
      emailSetting,
      EMAIL_SETTINGS.types.emailConfirmation.templateId,
      {
        emailVerificationUri,
      },
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

    let passwordResetUri = assertEnv(BlEnvironment.CLIENT_URI);
    passwordResetUri +=
      EMAIL_SETTINGS.types.passwordReset.path +
      pendingPasswordResetId +
      `?resetToken=${resetToken}`;

    await sendMail(
      emailSetting,
      EMAIL_SETTINGS.types.passwordReset.templateId,
      {
        passwordResetUri,
      },
    );
  }
}

export async function sendMail(
  emailSetting: EmailSetting,
  templateId: string,
  dynamicTemplateData: Record<string, string> = {},
) {
  try {
    await sgMail.send({
      from: emailSetting.fromEmail,
      to: emailSetting.toEmail,
      templateId,
      dynamicTemplateData,
    });
    logger.info("Successfully sent email to " + emailSetting.toEmail);
  } catch (error) {
    logger.error(
      `Failed to send email to ${emailSetting.toEmail}, error: ${error}`,
    );
  }
}
