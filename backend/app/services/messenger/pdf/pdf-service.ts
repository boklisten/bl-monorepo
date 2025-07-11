import { EmailAttachment, EmailHandler, PdfHandler } from "@boklisten/bl-email";
import moment from "moment";

import { isNotNullish } from "#services/helper/typescript-helpers";
import { OrderEmailHandler } from "#services/messenger/email/order_email_handler";
import { EmailOrder, EmailSetting, EmailUser } from "#services/types/email";
import { Order } from "#shared/order/order";
import { UserDetail } from "#shared/user/user-detail/user-detail";

export class PdfService {
  private pdfHandler: PdfHandler;
  private orderEmailHandler: OrderEmailHandler;
  private standardDayFormat = "DD.MM.YYYY";
  private utcOffset = 120;

  constructor() {
    const emailHandler = new EmailHandler({ locale: "nb" });
    this.pdfHandler = new PdfHandler(emailHandler);
    this.orderEmailHandler = new OrderEmailHandler();
  }

  async getOrderReceiptPdf(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailAttachment> {
    const emailSetting = {} as EmailSetting;

    const emailUser: EmailUser = {
      id: customerDetail.id,
      dob: isNotNullish(customerDetail.dob)
        ? moment(customerDetail.dob)
            .utcOffset(this.utcOffset)
            .format(this.standardDayFormat)
        : "",
      name: customerDetail.name,
      email: customerDetail.email,
      address: customerDetail.address,
    };

    const emailOrder: EmailOrder =
      await this.orderEmailHandler.orderToEmailOrder(order);

    return await this.pdfHandler.getOrderReceipt(
      emailSetting,
      emailOrder,
      emailUser,
    );
  }

  async getOrderAgreementPdf(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailAttachment> {
    const emailSetting = {} as EmailSetting;

    const emailUser: EmailUser = {
      id: customerDetail.id,
      dob: isNotNullish(customerDetail.dob)
        ? moment(customerDetail.dob)
            .utcOffset(this.utcOffset)
            .format(this.standardDayFormat)
        : "",
      name: customerDetail.name,
      email: customerDetail.email,
      address: customerDetail.address,
    };

    const emailOrder: EmailOrder =
      await this.orderEmailHandler.orderToEmailOrder(order);
    return await this.pdfHandler.getRentAgreement(
      emailSetting,
      emailOrder,
      emailUser,
    );
  }
}
