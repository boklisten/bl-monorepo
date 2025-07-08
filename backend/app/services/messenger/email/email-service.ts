import logger from "@adonisjs/core/services/logger";
import sgMail from "@sendgrid/mail";

import { DateService } from "#services/blc/date.service";
import { EMAIL_SETTINGS } from "#services/messenger/email/email-settings";
import { OrderEmailHandler } from "#services/messenger/email/order-email/order-email-handler";
import { MessengerService } from "#services/messenger/messenger-service";
import { EmailOrder, EmailSetting, EmailUser } from "#services/types/email";
import { Delivery } from "#shared/delivery/delivery";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";
import { UserDetail } from "#shared/user/user-detail/user-detail";
import env from "#start/env";

export class EmailService implements MessengerService {
  private orderEmailHandler: OrderEmailHandler;

  constructor() {
    sgMail.setApiKey(env.get("SENDGRID_API_KEY"));
    this.orderEmailHandler = new OrderEmailHandler();
  }

  public async orderPlaced(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<void> {
    await this.orderEmailHandler.sendOrderReceipt(customerDetail, order);
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

    await sendMail(
      emailSetting.fromEmail,
      "d-dc8ab3365a0f4fd8a69b6a38e6eb83f9",
      [
        {
          to: emailSetting.toEmail,
          dynamicTemplateData: {
            emailTemplateInput: {
              user: emailUser,
              order: emailOrder,
              userFullName: emailSetting.userFullName || emailUser.name,
              textBlocks: emailSetting.textBlocks,
            },
          },
        },
      ],
    );
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
