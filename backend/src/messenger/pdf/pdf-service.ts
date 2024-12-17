import { EmailAttachment, EmailHandler, PdfHandler } from "@boklisten/bl-email";
import { EmailOrder } from "@boklisten/bl-email/dist/ts/template/email-order";
import { EmailSetting } from "@boklisten/bl-email/dist/ts/template/email-setting";
import { EmailUser } from "@boklisten/bl-email/dist/ts/template/email-user";
import { Order, UserDetail } from "@boklisten/bl-model";
import moment from "moment";

import { isNotNullish } from "@/helper/typescript-helpers";
import { OrderEmailHandler } from "@/messenger/email/order-email/order-email-handler";

export class PdfService {
  private _pdfHandler: PdfHandler;
  private _standardDayFormat;
  private _orderEmailHandler: OrderEmailHandler;
  private _utcOffset: number;

  constructor() {
    const emailHandler = new EmailHandler({ locale: "nb" });
    this._pdfHandler = new PdfHandler(emailHandler);
    this._standardDayFormat = "DD.MM.YYYY";
    this._orderEmailHandler = new OrderEmailHandler(emailHandler);
    this._utcOffset = 120;
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
            .utcOffset(this._utcOffset)
            .format(this._standardDayFormat)
        : "",
      name: customerDetail.name,
      email: customerDetail.email,
      address: customerDetail.address,
    };

    const emailOrder: EmailOrder =
      await this._orderEmailHandler.orderToEmailOrder(order);

    return await this._pdfHandler.getOrderReceipt(
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
            .utcOffset(this._utcOffset)
            .format(this._standardDayFormat)
        : "",
      name: customerDetail.name,
      email: customerDetail.email,
      address: customerDetail.address,
    };

    const emailOrder: EmailOrder =
      await this._orderEmailHandler.orderToEmailOrder(order);
    return await this._pdfHandler.getRentAgreement(
      emailSetting,
      emailOrder,
      emailUser,
    );
  }
}
