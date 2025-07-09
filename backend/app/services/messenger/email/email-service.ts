import logger from "@adonisjs/core/services/logger";
import sgMail from "@sendgrid/mail";

import { DateService } from "#services/blc/date.service";
import {
  AllowedEmailSender,
  EMAIL_SENDER,
  EMAIL_SETTINGS,
} from "#services/messenger/email/email-settings";
import { OrderEmailHandler } from "#services/messenger/email/order-email/order-email-handler";
import { MessengerService } from "#services/messenger/messenger-service";
import { EmailOrder, EmailUser } from "#services/types/email";
import { Delivery } from "#shared/delivery/delivery";
import { Order } from "#shared/order/order";
import { OrderItem } from "#shared/order/order-item/order-item";
import { UserDetail } from "#shared/user/user-detail/user-detail";
import env from "#start/env";
import { SendGridTemplateId } from "#validators/send_grid_template_id_validator";

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

    // fixme: create a new template for this, that actually also shows the textblocks and "Dine bøker er på vei" as a subject
    // fixme: add a custom subject with the order id
    await sendMail({
      from: EMAIL_SENDER.NO_REPLY,
      templateId: EMAIL_SETTINGS.deliveryInformation.templateId,
      recipients: [
        {
          to: customerDetail.email,
          dynamicTemplateData: {
            emailTemplateInput: {
              user: emailUser,
              order: emailOrder,
              userFullName: emailUser.name,
              textBlocks: [
                {
                  text: "Dine bøker er nå på vei! De vil bli levert til deg ved hjelp av Bring.",
                },
                {
                  text: "Vi anser nå disse bøkene som utlevert. Du er ansvarlig for bøkene fra du henter dem på postkontoret til innlevering er gjennomført. Om noe skulle skje med leveringen er det bare å ta kontakt. Fraktkostnader refunderes ikke for pakker som ikke blir hentet innen fristen.",
                },
              ],
            },
          },
        },
      ],
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
    await sendMail({
      from: EMAIL_SENDER.NO_REPLY,
      templateId: EMAIL_SETTINGS.emailConfirmation.templateId,
      recipients: [
        {
          to: customerDetail.email,
          dynamicTemplateData: {
            emailVerificationUri: `${env.get("CLIENT_URI")}${EMAIL_SETTINGS.emailConfirmation.path}${confirmationCode}`,
          },
        },
      ],
    });
  }

  public async passwordReset(
    userId: string,
    userEmail: string,
    pendingPasswordResetId: string,
    resetToken: string,
  ): Promise<void> {
    let passwordResetUri = env.get("CLIENT_URI");
    passwordResetUri +=
      EMAIL_SETTINGS.passwordReset.path +
      pendingPasswordResetId +
      `?resetToken=${resetToken}`;

    await sendMail({
      from: EMAIL_SENDER.NO_REPLY,
      templateId: EMAIL_SETTINGS.passwordReset.templateId,
      recipients: [
        {
          to: userEmail,
          dynamicTemplateData: {
            passwordResetUri,
          },
        },
      ],
    });
  }
}

export async function sendMail({
  from,
  templateId,
  recipients,
}: {
  from: AllowedEmailSender;
  templateId: SendGridTemplateId;
  recipients: {
    to: string;
    // fixme: make this typesafe by defining the structure for each type of template ID
    dynamicTemplateData?: Record<string, unknown>;
  }[];
}): Promise<{ success: boolean }> {
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
