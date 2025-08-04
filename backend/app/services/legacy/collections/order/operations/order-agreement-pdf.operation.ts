import { PdfService } from "#services/pdf_service";
import { BlStorage } from "#services/storage/bl-storage";
import { BlapiResponse } from "#shared/blapi-response";
import { BlApiRequest } from "#types/bl-api-request";
import { Operation } from "#types/operation";

export class OrderAgreementPdfOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    const order = await BlStorage.Orders.get(blApiRequest.documentId);
    const customerDetail = await BlStorage.UserDetails.get(order.customer);

    const orderReceiptPdf = await PdfService.getOrderAgreementPdf(
      customerDetail,
      order,
    );

    return new BlapiResponse([orderReceiptPdf]);
  }
}
