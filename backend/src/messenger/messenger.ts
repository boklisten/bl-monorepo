import { EmailService } from "@backend/messenger/email/email-service";
import { MessengerService } from "@backend/messenger/messenger-service";
import { PdfService } from "@backend/messenger/pdf/pdf-service";
import { BlStorage } from "@backend/storage/bl-storage";
import { EmailAttachment } from "@boklisten/bl-email";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Message } from "@shared/message/message";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class Messenger implements MessengerService {
  private emailService = new EmailService();
  private pdfService = new PdfService();

  /**
   * send out message(s) to the customer
   * @param {Message[]} message
   * @param {UserDetail} customerDetail
   */
  public async send(
    message: Message,
    customerDetail: UserDetail,
  ): Promise<void> {
    await this.emailService.send(message, customerDetail);
  }

  /**
   * reminds the customer of the due date of his items
   * @param message the message to send
   * @param customerDetail the customer to send reminder to
   * @param customerItems the customerItems to remind of
   */
  public async remind(
    message: Message,
    customerDetail: UserDetail,
    customerItems: CustomerItem[],
  ): Promise<void> {
    await this.emailService.remind(message, customerDetail, customerItems);
  }

  /**
   * sends out notifications to the customer when order is placed
   * @param {UserDetail} customerDetail
   * @param {Order} order
   */
  public async orderPlaced(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<void> {
    await this.emailService.orderPlaced(customerDetail, order);
  }

  /**
   * returns a pdf of the receipt of the provided order
   * @param {UserDetail} customerDetail
   * @param {Order} order
   */
  public async getOrderReceiptPdf(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailAttachment> {
    return await this.pdfService.getOrderReceiptPdf(customerDetail, order);
  }

  /**
   * returns a pdf of the agreement of the provided order
   * @param {UserDetail} customerDetail
   * @param {Order} order
   */
  public async getOrderAgreementPdf(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailAttachment> {
    return await this.pdfService.getOrderAgreementPdf(customerDetail, order);
  }

  public async sendDeliveryInformation(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<void> {
    const deliveryId = typeof order.delivery === "string" ? order.delivery : "";
    const delivery = await BlStorage.Deliveries.get(deliveryId);
    await this.emailService.deliveryInformation(
      customerDetail,
      order,
      delivery,
    );
  }

  /**
   * sends out message to customer with a link to confirm email
   * @param {UserDetail} customerDetail
   * @param {string} confirmationCode
   */
  public async emailConfirmation(
    customerDetail: UserDetail,
    confirmationCode: string,
  ): Promise<void> {
    await this.emailService.emailConfirmation(customerDetail, confirmationCode);
  }

  /**
   * sends out message to customer with a link to reset password
   * @param {string} userId the ID of the user in the Users collection
   * @param {string} userEmail the email (username) of the user in the Users collection
   * @param pendingPasswordResetId the ID of the PendingPasswordReset for the request
   * @param resetToken the token required to confirm the PendingPasswordReset
   */
  public async passwordReset(
    userId: string,
    userEmail: string,
    pendingPasswordResetId: string,
    resetToken: string,
  ): Promise<void> {
    await this.emailService.passwordReset(
      userId,
      userEmail,
      pendingPasswordResetId,
      resetToken,
    );
  }
}
