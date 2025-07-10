import logger from "@adonisjs/core/services/logger";
import sgMail from "@sendgrid/mail";

import { DateService } from "#services/blc/date.service";
import {
  EMAIL_TEMPLATES,
  EmailTemplate,
} from "#services/messenger/email/email_templates";
import { OrderEmailHandler } from "#services/messenger/email/order_email_handler";
import { EmailOrder, EmailUser } from "#services/types/email";
import { Delivery } from "#shared/delivery/delivery";
import { Order } from "#shared/order/order";
import { UserDetail } from "#shared/user/user-detail/user-detail";
import env from "#start/env";

export class EmailService {
  private orderEmailHandler = new OrderEmailHandler();

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
      items: order.orderItems.map((orderItem) => ({
        title: orderItem.title,
        status: "utlevering via Bring",
      })),
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

    await sendMail({
      template: EMAIL_TEMPLATES.deliveryInformation,
      recipients: [
        {
          to: customerDetail.email,
          subject: "Dine bøker er på vei",
          dynamicTemplateData: {
            emailTemplateInput: {
              user: emailUser,
              order: emailOrder,
              userFullName: emailUser.name,
              textBlocks: [
                "Dine bøker er nå på vei! De vil bli levert til deg ved hjelp av Bring.",
                "Vi anser nå disse bøkene som utlevert. Du er ansvarlig for bøkene fra du henter dem på postkontoret til innlevering er gjennomført. Om noe skulle skje med leveringen er det bare å ta kontakt. Fraktkostnader refunderes ikke for pakker som ikke blir hentet innen fristen.",
              ],
            },
          },
        },
      ],
    });
  }

  public async emailConfirmation(
    customerDetail: UserDetail,
    confirmationCode: string,
  ): Promise<void> {
    await sendMail({
      template: EMAIL_TEMPLATES.emailConfirmation,
      recipients: [
        {
          to: customerDetail.email,
          dynamicTemplateData: {
            emailVerificationUri: `${env.get("CLIENT_URI")}auth/email/confirm/${confirmationCode}`,
          },
        },
      ],
    });
  }
}

export async function sendMail({
  template,
  recipients,
}: {
  template: EmailTemplate;
  recipients: {
    to: string;
    subject?: string;
    dynamicTemplateData?: Record<string, unknown>;
  }[];
}): Promise<{ success: boolean }> {
  try {
    const [sendGridResponse] = await sgMail.send({
      from: template.sender,
      templateId: template.templateId,
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
