import { EmailService } from "@backend/lib/messenger/email/email-service.js";
import { PdfService } from "@backend/lib/messenger/pdf/pdf-service.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
const emailService = new EmailService();
const pdfService = new PdfService();
/**
 * send out message(s) to the customer
 * @param {Message[]} message
 * @param {UserDetail} customerDetail
 */
async function send(message, customerDetail) {
    await emailService.send(message, customerDetail);
}
/**
 * reminds the customer of the due date of his items
 * @param message the message to send
 * @param customerDetail the customer to send reminder to
 * @param customerItems the customerItems to remind of
 */
async function remind(message, customerDetail, customerItems) {
    await emailService.remind(message, customerDetail, customerItems);
}
/**
 * sends out notifications to the customer when order is placed
 * @param {UserDetail} customerDetail
 * @param {Order} order
 */
async function orderPlaced(customerDetail, order) {
    await emailService.orderPlaced(customerDetail, order);
}
/**
 * returns a pdf of the receipt of the provided order
 * @param {UserDetail} customerDetail
 * @param {Order} order
 */
async function getOrderReceiptPdf(customerDetail, order) {
    return await pdfService.getOrderReceiptPdf(customerDetail, order);
}
/**
 * returns a pdf of the agreement of the provided order
 * @param {UserDetail} customerDetail
 * @param {Order} order
 */
async function getOrderAgreementPdf(customerDetail, order) {
    return await pdfService.getOrderAgreementPdf(customerDetail, order);
}
async function sendDeliveryInformation(customerDetail, order) {
    const deliveryId = typeof order.delivery === "string" ? order.delivery : "";
    const delivery = await BlStorage.Deliveries.get(deliveryId);
    await emailService.deliveryInformation(customerDetail, order, delivery);
}
/**
 * sends out message to customer with a link to confirm email
 * @param {UserDetail} customerDetail
 * @param {string} confirmationCode
 */
async function emailConfirmation(customerDetail, confirmationCode) {
    await emailService.emailConfirmation(customerDetail, confirmationCode);
}
/**
 * sends out message to customer with a link to reset password
 * @param {string} userId the ID of the user in the Users collection
 * @param {string} userEmail the email (username) of the user in the Users collection
 * @param pendingPasswordResetId the ID of the PendingPasswordReset for the request
 * @param resetToken the token required to confirm the PendingPasswordReset
 */
async function passwordReset(userId, userEmail, pendingPasswordResetId, resetToken) {
    await emailService.passwordReset(userId, userEmail, pendingPasswordResetId, resetToken);
}
const Messenger = {
    send,
    remind,
    orderPlaced,
    getOrderReceiptPdf,
    getOrderAgreementPdf,
    sendDeliveryInformation,
    emailConfirmation,
    passwordReset,
};
export default Messenger;
