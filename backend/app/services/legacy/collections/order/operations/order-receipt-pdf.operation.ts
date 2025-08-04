import { PdfService } from "#services/pdf_service";
import { StorageService } from "#services/storage_service";
import { BlapiResponse } from "#shared/blapi-response";
import { BlApiRequest } from "#types/bl-api-request";
import { Operation } from "#types/operation";

export class OrderReceiptPdfOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    const order = await StorageService.Orders.get(blApiRequest.documentId);
    const customerDetail = await StorageService.UserDetails.get(order.customer);

    const orderReceiptPdf = await PdfService.getOrderReceiptPdf(
      customerDetail,
      order,
    );

    return new BlapiResponse([orderReceiptPdf]);
  }
}
