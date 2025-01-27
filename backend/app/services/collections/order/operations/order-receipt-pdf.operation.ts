import Messenger from "#services/messenger/messenger";
import { BlStorage } from "#services/storage/bl-storage";
import { BlApiRequest } from "#services/types/bl-api-request";
import { Operation } from "#services/types/operation";
import { BlapiResponse } from "#shared/blapi-response/blapi-response";

export class OrderReceiptPdfOperation implements Operation {
  async run(blApiRequest: BlApiRequest) {
    const order = await BlStorage.Orders.get(blApiRequest.documentId);
    const customerDetail = await BlStorage.UserDetails.get(order.customer);

    const orderReceiptPdf = await Messenger.getOrderReceiptPdf(
      customerDetail,
      order,
    );

    return new BlapiResponse([orderReceiptPdf]);
  }
}
