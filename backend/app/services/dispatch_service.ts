import logger from "@adonisjs/core/services/logger";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";

import { DateService } from "#services/legacy/date.service";
import { OrderEmailHandler } from "#services/legacy/order_email_handler";
import { StorageService } from "#services/storage_service";
import { Order } from "#shared/order/order";
import { UserDetail } from "#shared/user-detail";
import env from "#start/env";
import { EmailOrder, EmailUser } from "#types/email";
import {
  EMAIL_SENDER,
  EMAIL_TEMPLATES,
  EmailRecipient,
  EmailTemplate,
} from "#types/email_templates";
import { assertSendGridTemplateId } from "#validators/send_grid_template_id_validator";

const twilioClient = twilio(
  env.get("TWILIO_SMS_SID"),
  env.get("TWILIO_SMS_AUTH_TOKEN"),
  {
    autoRetry: true,
    maxRetries: 5,
  },
);

interface SmsMessage {
  to: string;
  body: string;
}

const SmsService = {
  async sendOne(message: SmsMessage) {
    try {
      await twilioClient.messages.create({
        body: message.body,
        to: `+47${message.to}`,
        from: "Boklisten",
      });
      logger.info(`successfully sent SMS to "${message.to}"`);
      return { successCount: 1, failed: [] };
    } catch (error) {
      logger.error(`failed to send SMS to "${message.to}", reason: ${error}`);
      return { successCount: 0, failed: [message.to] };
    }
  },
  async sendMany(messages: SmsMessage[]) {
    return (
      await Promise.all(messages.map((message) => this.sendOne(message)))
    ).reduce(
      (acc, next) => ({
        successCount: acc.successCount + next.successCount,
        failed: [...acc.failed, ...next.failed],
      }),
      { successCount: 0, failed: [] },
    );
  },
};

// SendGrid allows a maximum of 1000 personalizations per request
const SENDGRID_BATCH_SIZE = 1000;
const EmailService = {
  async sendEmail({
    template,
    recipients,
  }: {
    template: EmailTemplate;
    recipients: EmailRecipient | EmailRecipient[];
  }) {
    const personalizations = Array.isArray(recipients)
      ? recipients
      : [recipients];

    const batches: EmailRecipient[][] = [];
    for (let i = 0; i < personalizations.length; i += SENDGRID_BATCH_SIZE) {
      batches.push(personalizations.slice(i, i + SENDGRID_BATCH_SIZE));
    }

    for (const batch of batches) {
      try {
        const [sendGridResponse] = await sgMail.send({
          from: template.sender,
          templateId: template.templateId,
          personalizations: batch,
        });

        if (sendGridResponse.statusCode !== 202) {
          logger.error(
            `SendGrid batch failed with status ${sendGridResponse.statusCode}`,
          );
          return { success: false };
        }
      } catch (error) {
        logger.error(`SendGrid send error: ${String(error)}`);
        return { success: false };
      }
    }

    return { success: true };
  },
};

const DispatchService = {
  // fixme: maybe not expose this
  async sendSMS(message: SmsMessage | SmsMessage[]) {
    if (Array.isArray(message)) {
      return await SmsService.sendMany(message);
    }
    return await SmsService.sendOne(message);
  },
  // fixme: maybe not expose this
  async sendEmail({
    template,
    recipients,
  }: {
    template: EmailTemplate;
    recipients: EmailRecipient | EmailRecipient[];
  }) {
    return await EmailService.sendEmail({ template, recipients });
  },

  async sendOrderReceipt(customerDetail: UserDetail, order: Order) {
    await new OrderEmailHandler().sendOrderReceipt(customerDetail, order);
  },

  async sendDeliveryInformation(customerDetail: UserDetail, order: Order) {
    const deliveryId = typeof order.delivery === "string" ? order.delivery : "";
    const delivery = await StorageService.Deliveries.get(deliveryId);
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

    await EmailService.sendEmail({
      template: EMAIL_TEMPLATES.deliveryInformation,
      recipients: [
        {
          to: customerDetail.email,
          dynamicTemplateData: {
            subject: "Dine bøker er på vei",
            emailTemplateInput: {
              user: emailUser,
              order: emailOrder,
              userFullName: emailUser.name,
            },
            // fixme: this text is not displayed, make a separate email for deliveries
            textBlock:
              "Dine bøker er nå på vei! De vil bli levert til deg ved hjelp av Bring. Vi anser nå disse bøkene som utlevert. Du er ansvarlig for bøkene fra du henter dem på postkontoret til innlevering er gjennomført. Om noe skulle skje med leveringen er det bare å ta kontakt. Fraktkostnader refunderes ikke for pakker som ikke blir hentet innen fristen.",
          },
        },
      ],
    });
  },

  async sendPasswordReset({
    email,
    resetId,
    token,
  }: {
    email: string;
    resetId: string;
    token: string;
  }) {
    return await EmailService.sendEmail({
      template: EMAIL_TEMPLATES.passwordReset,
      recipients: [
        {
          to: email,
          dynamicTemplateData: {
            passwordResetUri: `${env.get("NEXT_CLIENT_URI")}auth/reset/${resetId}?resetToken=${token}`,
          },
        },
      ],
    });
  },

  // fixme: rename confirmation to verification everywhere
  async sendEmailConfirmation(email: string, confirmationCode: string) {
    await EmailService.sendEmail({
      template: EMAIL_TEMPLATES.emailConfirmation,
      recipients: [
        {
          to: email,
          dynamicTemplateData: {
            emailVerificationUri: `${env.get("NEXT_CLIENT_URI")}auth/email/confirm/${confirmationCode}`,
          },
        },
      ],
    });
  },
  async sendMatchInformation({
    customers,
    smsBody,
  }: {
    customers: UserDetail[];
    smsBody: string;
  }) {
    const [mailStatus, smsStatus] = await Promise.all([
      EmailService.sendEmail({
        template: EMAIL_TEMPLATES.matchNotify,
        recipients: customers.map((customer) => ({
          to: customer.email,
          dynamicTemplateData: {
            name: customer.name.split(" ")[0] ?? customer.name,
            username: customer.email,
          },
        })),
      }),
      SmsService.sendMany(
        customers.map((customer) => ({
          to: customer.phone,
          body: `Hei, ${customer.name.split(" ")[0]}. ${smsBody} Mvh Boklisten`,
        })),
      ),
    ]);
    return { mailStatus, smsStatus };
  },
  async sendUserProvidedEmailTemplate({
    maybeEmailTemplateId,
    recipients,
  }: {
    maybeEmailTemplateId: string;
    recipients: EmailRecipient[];
  }) {
    return await EmailService.sendEmail({
      template: {
        sender: EMAIL_SENDER.INFO,
        templateId: assertSendGridTemplateId(maybeEmailTemplateId),
      },
      recipients,
    });
  },
};

export default DispatchService;
