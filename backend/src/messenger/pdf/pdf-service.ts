import { isNotNullish } from "@backend/helper/typescript-helpers";
import { OrderEmailHandler } from "@backend/messenger/email/order-email/order-email-handler";
import { EmailAttachment, EmailHandler, PdfHandler } from "@boklisten/bl-email";
import { EmailOrder } from "@boklisten/bl-email/dist/ts/template/email-order";
import { EmailSetting } from "@boklisten/bl-email/dist/ts/template/email-setting";
import { EmailUser } from "@boklisten/bl-email/dist/ts/template/email-user";
import { Order } from "@shared/order/order";
import { UserDetail } from "@shared/user/user-detail/user-detail";
import moment from "moment";

export class PdfService {
  private pdfHandler: PdfHandler;
  private orderEmailHandler: OrderEmailHandler;
  private standardDayFormat = "DD.MM.YYYY";
  private utcOffset = 120;

  constructor() {
    const emailHandler = new EmailHandler({ locale: "nb" });
    this.pdfHandler = new PdfHandler(emailHandler);
    this.orderEmailHandler = new OrderEmailHandler(emailHandler);
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
