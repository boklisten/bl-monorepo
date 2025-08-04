import { EmailAttachment, EmailHandler, PdfHandler } from "@boklisten/bl-email";
import moment from "moment";

import { OrderEmailHandler } from "#services/legacy/order_email_handler";
import { isNotNullish } from "#services/legacy/typescript-helpers";
import { Order } from "#shared/order/order";
import { UserDetail } from "#shared/user-detail";
import { EmailSetting, EmailUser } from "#types/email";

const pdfHandler = new PdfHandler(new EmailHandler({ locale: "nb" }));
const orderEmailHandler = new OrderEmailHandler();
const standardDayFormat = "DD.MM.YYYY";
const utcOffset = 120;

export const PdfService = {
  async getOrderReceiptPdf(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailAttachment> {
    const emailUser = {
      id: customerDetail.id,
      dob: isNotNullish(customerDetail.dob)
        ? moment(customerDetail.dob)
            .utcOffset(utcOffset)
            .format(standardDayFormat)
        : "",
      name: customerDetail.name,
      email: customerDetail.email,
      address: customerDetail.address,
    } as const satisfies EmailUser;

    const emailOrder = await orderEmailHandler.orderToEmailOrder(order);

    return await pdfHandler.getOrderReceipt(
      {} as EmailSetting,
      emailOrder,
      emailUser,
    );
  },
  async getOrderAgreementPdf(
    customerDetail: UserDetail,
    order: Order,
  ): Promise<EmailAttachment> {
    const emailUser = {
      id: customerDetail.id,
      dob: isNotNullish(customerDetail.dob)
        ? moment(customerDetail.dob)
            .utcOffset(utcOffset)
            .format(standardDayFormat)
        : "",
      name: customerDetail.name,
      email: customerDetail.email,
      address: customerDetail.address,
    } as const satisfies EmailUser;

    const emailOrder = await orderEmailHandler.orderToEmailOrder(order);
    return await pdfHandler.getRentAgreement(
      {} as EmailSetting,
      emailOrder,
      emailUser,
    );
  },
};
