import { isNotNullish } from "@backend/lib/helper/typescript-helpers.js";
import { OrderEmailHandler } from "@backend/lib/messenger/email/order-email/order-email-handler.js";
import { EmailHandler, PdfHandler } from "@boklisten/bl-email";
import moment from "moment";
export class PdfService {
    pdfHandler;
    orderEmailHandler;
    standardDayFormat = "DD.MM.YYYY";
    utcOffset = 120;
    constructor() {
        const emailHandler = new EmailHandler({ locale: "nb" });
        this.pdfHandler = new PdfHandler(emailHandler);
        this.orderEmailHandler = new OrderEmailHandler(emailHandler);
    }
    async getOrderReceiptPdf(customerDetail, order) {
        const emailSetting = {};
        const emailUser = {
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
        const emailOrder = await this.orderEmailHandler.orderToEmailOrder(order);
        return await this.pdfHandler.getOrderReceipt(emailSetting, emailOrder, emailUser);
    }
    async getOrderAgreementPdf(customerDetail, order) {
        const emailSetting = {};
        const emailUser = {
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
        const emailOrder = await this.orderEmailHandler.orderToEmailOrder(order);
        return await this.pdfHandler.getRentAgreement(emailSetting, emailOrder, emailUser);
    }
}
