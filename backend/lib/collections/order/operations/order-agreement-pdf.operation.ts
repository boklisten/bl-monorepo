import Messenger from "@backend/lib/messenger/messenger.js";
import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlApiRequest } from "@backend/types/bl-api-request.js";
import { Operation } from "@backend/types/operation.js";
import { BlapiResponse } from "@shared/blapi-response/blapi-response.js";

export class OrderAgreementPdfOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    const order = await BlStorage.Orders.get(blApiRequest.documentId);
    const customerDetail = await BlStorage.UserDetails.get(order.customer);

    const orderReceiptPdf = await Messenger.getOrderAgreementPdf(
      customerDetail,
      order,
    );

    return new BlapiResponse([orderReceiptPdf]);
  }
}
