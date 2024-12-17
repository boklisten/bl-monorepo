import { BlCollectionName } from "@backend/collections/bl-collection";
import { deliverySchema } from "@backend/collections/delivery/delivery.schema";
import { EmailService } from "@backend/messenger/email/email-service";
import {
  MessengerService,
  CustomerDetailWithCustomerItem,
} from "@backend/messenger/messenger-service";
import { PdfService } from "@backend/messenger/pdf/pdf-service";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { EmailAttachment } from "@boklisten/bl-email";
import { CustomerItem } from "@shared/customer-item/customer-item";
import { Delivery } from "@shared/delivery/delivery";
import { Message } from "@shared/message/message";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";

export class Messenger implements MessengerService {
  private readonly _emailService: EmailService;
  private readonly _pdfService: PdfService;
  private readonly _deliveryStorage: BlDocumentStorage<Delivery>;

  constructor() {
    this._emailService = new EmailService();
    this._deliveryStorage = new BlDocumentStorage<Delivery>(
      BlCollectionName.Deliveries,
      deliverySchema,
    );
    this._pdfService = new PdfService();
  }

  /**
   * send out message(s) to the customer
   * @param {Message[]} message
   * @param {UserDetail} customerDetail
   */
  public async send(
    message: Message,
    customerDetail: UserDetail,
  ): Promise<void> {
    await this._emailService.send(message, customerDetail);
  }

  /**
   * send out message(s) to the customer
   * @param {Message[]} messages
   * @param {UserDetail[]} customerDetails
   */
  public async sendMany(
    messages: Message[],
    customerDetails: UserDetail[],
  ): Promise<void> {
    await this._emailService.sendMany(messages, customerDetails);
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
    await this._emailService.remind(message, customerDetail, customerItems);
  }

  /**
   * sends out reminders to more than one customer
   * @param customerDetailsWithCustomerItems customerDetails with customerItems to remind about
   */
  public async remindMany(
    customerDetailsWithCustomerItems: CustomerDetailWithCustomerItem[],
  ): Promise<void> {
    await this._emailService.remindMany(customerDetailsWithCustomerItems);
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
    await this._emailService.orderPlaced(customerDetail, order);
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
    return await this._pdfService.getOrderReceiptPdf(customerDetail, order);
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
    return await this._pdfService.getOrderAgreementPdf(customerDetail, order);
  }

  public async sendDeliveryInformation(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<void> {
    const deliveryId = typeof order.delivery === "string" ? order.delivery : "";
    const delivery = await this._deliveryStorage.get(deliveryId);
    await this._emailService.deliveryInformation(
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
    await this._emailService.emailConfirmation(
      customerDetail,
      confirmationCode,
    );
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
    await this._emailService.passwordReset(
      userId,
      userEmail,
      pendingPasswordResetId,
      resetToken,
    );
  }
}
