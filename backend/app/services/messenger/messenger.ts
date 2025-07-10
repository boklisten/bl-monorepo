import { EmailAttachment } from "@boklisten/bl-email";

import { EmailService } from "#services/messenger/email/email_service";
import { PdfService } from "#services/messenger/pdf/pdf-service";
import { BlStorage } from "#services/storage/bl-storage";
import { Order } from "#shared/order/order";
import { UserDetail } from "#shared/user/user-detail/user-detail";

const emailService = new EmailService();
const pdfService = new PdfService();

/**
 * sends out notifications to the customer when order is placed
 * @param {UserDetail} customerDetail
 * @param {Order} order
 */
async function orderPlaced(
  customerDetail: UserDetail,
  order: Order,
): Promise<void> {
  await emailService.orderPlaced(customerDetail, order);
}

/**
 * returns a pdf of the receipt of the provided order
 * @param {UserDetail} customerDetail
 * @param {Order} order
 */
async function getOrderReceiptPdf(
  customerDetail: UserDetail,
  order: Order,
): Promise<EmailAttachment> {
  return await pdfService.getOrderReceiptPdf(customerDetail, order);
}

/**
 * returns a pdf of the agreement of the provided order
 * @param {UserDetail} customerDetail
 * @param {Order} order
 */
async function getOrderAgreementPdf(
  customerDetail: UserDetail,
  order: Order,
): Promise<EmailAttachment> {
  return await pdfService.getOrderAgreementPdf(customerDetail, order);
}

async function sendDeliveryInformation(
  customerDetail: UserDetail,
  order: Order,
): Promise<void> {
  const deliveryId = typeof order.delivery === "string" ? order.delivery : "";
  const delivery = await BlStorage.Deliveries.get(deliveryId);
  await emailService.deliveryInformation(customerDetail, order, delivery);
}

/**
 * sends out message to customer with a link to confirm email
 * @param {UserDetail} customerDetail
 * @param {string} confirmationCode
 */
async function emailConfirmation(
  customerDetail: UserDetail,
  confirmationCode: string,
): Promise<void> {
  await emailService.emailConfirmation(customerDetail, confirmationCode);
}

const Messenger = {
  orderPlaced,
  getOrderReceiptPdf,
  getOrderAgreementPdf,
  sendDeliveryInformation,
  emailConfirmation,
};

export default Messenger;
