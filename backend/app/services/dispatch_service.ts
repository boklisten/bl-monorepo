import logger from "@adonisjs/core/services/logger";
import { EmailAttachment } from "@boklisten/bl-email";
import twilio from "twilio";

import { EmailService } from "#services/messenger/email/email_service";
import { PdfService } from "#services/messenger/pdf/pdf-service";
import { BlStorage } from "#services/storage/bl-storage";
import { Order } from "#shared/order/order";
import { UserDetail } from "#shared/user-detail";
import env from "#start/env";

const emailService = new EmailService();
const pdfService = new PdfService();
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

const DispatchService = {
  async sendSMS(message: SmsMessage | SmsMessage[]) {
    if (Array.isArray(message)) {
      return await SmsService.sendMany(message);
    }
    return await SmsService.sendOne(message);
  },
  async orderPlaced(customerDetail: UserDetail, order: Order): Promise<void> {
    await emailService.orderPlaced(customerDetail, order);
  },

  async getOrderReceiptPdf(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailAttachment> {
    return await pdfService.getOrderReceiptPdf(customerDetail, order);
  },

  async getOrderAgreementPdf(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailAttachment> {
    return await pdfService.getOrderAgreementPdf(customerDetail, order);
  },

  async sendDeliveryInformation(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<void> {
    const deliveryId = typeof order.delivery === "string" ? order.delivery : "";
    const delivery = await BlStorage.Deliveries.get(deliveryId);
    await emailService.deliveryInformation(customerDetail, order, delivery);
  },

  async emailConfirmation(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await emailService.emailConfirmation(email, confirmationCode);
  },
};

export default DispatchService;
