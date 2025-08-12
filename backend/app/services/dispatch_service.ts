import logger from "@adonisjs/core/services/logger";
import sgMail from "@sendgrid/mail";
import moment from "moment-timezone";
import twilio from "twilio";

import {
  isUnderage,
  userHasValidSignature,
} from "#services/legacy/collections/signature/helpers/signature.helper";
import { OrderEmailHandler } from "#services/legacy/order_email_handler";
import { StorageService } from "#services/storage_service";
import { DeliveryInfoBring } from "#shared/delivery/delivery-info/delivery-info-bring";
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
  async sendReminderSms(phoneNumbers: string[], body: string) {
    return await SmsService.sendMany(phoneNumbers.map((to) => ({ to, body })));
  },
  async sendOrderReceipt(
    emailUser: EmailUser,
    emailOrder: EmailOrder,
    paymentNeeded: boolean,
  ) {
    await EmailService.sendEmail({
      template: EMAIL_TEMPLATES.receipt,
      recipients: [
        {
          to: emailUser.email,
          dynamicTemplateData: {
            subject: "Din kvittering fra Boklisten.no #" + emailOrder.id,
            emailTemplateInput: {
              user: emailUser,
              order: emailOrder,
              userFullName: emailUser.name,
              // fixme: this is not visible since the sendout does not currently show textblocks
            },
            textBlock: paymentNeeded
              ? "Dette er kun en reservasjon, du har ikke betalt enda. Du betaler først når du kommer til oss på stand."
              : undefined,
          },
        },
      ],
    });
  },
  async sendSignatureLink(customerDetail: UserDetail, branchName: string) {
    if (await userHasValidSignature(customerDetail)) return;
    await StorageService.UserDetails.update(customerDetail.id, {
      "tasks.signAgreement": true,
    });

    if (isUnderage(customerDetail) && customerDetail.guardian) {
      await EmailService.sendEmail({
        template: EMAIL_TEMPLATES.guardianSignature,
        recipients: {
          to: customerDetail.guardian.email,
          dynamicTemplateData: {
            guardianSignatureUri: `${env.get("NEXT_CLIENT_URI")}signering/${customerDetail.id}`,
            customerName: customerDetail.name,
            guardianName: customerDetail.guardian.name,
            branchName: branchName,
          },
        },
      });

      await SmsService.sendOne({
        to: customerDetail.guardian.phone,
        body: `Hei. ${customerDetail.name} skal snart motta bøker fra ${branchName} via Boklisten.no. Siden ${customerDetail.name} er under 18 år, krever vi at du som foresatt signerer låneavtalen. Vi har derfor sendt en e-post til ${customerDetail.guardian.email} med lenke til signering. Ta kontakt på info@boklisten.no om du har spørsmål. Mvh. Boklisten`,
      });
    } else {
      await EmailService.sendEmail({
        template: EMAIL_TEMPLATES.signature,
        recipients: {
          to: customerDetail.email,
          dynamicTemplateData: {
            signatureUri: `${env.get("NEXT_CLIENT_URI")}signering/${customerDetail.id}`,
            name: customerDetail.name,
            branchName: branchName,
          },
        },
      });

      await SmsService.sendOne({
        to: customerDetail.phone,
        body: `Hei. Du skal snart motta bøker fra ${branchName} via Boklisten.no. Før du kan motta bøkene må du signere vår låneavtale. Vi har derfor sendt en e-post til ${customerDetail.email} med lenke til signering. Ta kontakt på info@boklisten.no om du har spørsmål. Mvh. Boklisten`,
      });
    }
  },

  async sendDeliveryInformation(
    customerDetail: UserDetail,
    order: Order,
    bringDeliveryInfo: DeliveryInfoBring,
  ) {
    await EmailService.sendEmail({
      template: EMAIL_TEMPLATES.deliveryInformation,
      recipients: [
        {
          to: customerDetail.email,
          dynamicTemplateData: {
            firstName: customerDetail.name.split(" ")[0],
            orderId: order.id,
            orderItems: order.orderItems.map((orderItem) => ({
              title: orderItem.title,
              type: OrderEmailHandler.translateOrderItemType(orderItem.type),
              deadline: orderItem.info?.to
                ? moment(orderItem.info.to)
                    .add(1, "day") // fixme: we need to add one day to get the correct date due to a time zone issue
                    .format("DD/MM/YYYY")
                : "",
            })),
            expectedDeliveryDate: bringDeliveryInfo.estimatedDelivery
              ? moment(bringDeliveryInfo.estimatedDelivery).format("DD/MM/YYYY")
              : "Ukjent",
            trackingNumber: bringDeliveryInfo.trackingNumber,
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
  async sendOnboardingMessage({
    userDetail,
    branchName,
  }: {
    userDetail: UserDetail;
    branchName: string;
  }) {
    const firstName = userDetail.name.split(" ")[0];
    const emailStatus = await EmailService.sendEmail({
      template: EMAIL_TEMPLATES.onboarding,
      recipients: {
        to: userDetail.email,
        dynamicTemplateData: {
          firstName,
          branchName,
          loginUri: `${env.get("NEXT_CLIENT_URI")}auth/login`,
        },
      },
    });
    const smsStatus = await SmsService.sendOne({
      to: userDetail.phone,
      body: `Hei ${firstName}, velkommen til ${branchName}! Vi i Boklisten administrerer utlån av bøkene du skal bruke, og før du kan få dem trenger vi at du bekrefter informasjonen din og signerer vår låneavtale på Boklisten.no. Er du under 18 år, må en foresatt signere. Vi har opprettet en konto til deg, og du kan logge inn med Vipps eller opprette et passord for å komme i gang. Mvh. Boklisten.no`,
    });
    return { emailStatus, smsStatus };
  },
};

export default DispatchService;
